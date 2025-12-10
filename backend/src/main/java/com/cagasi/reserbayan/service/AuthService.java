package com.cagasi.reserbayan.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cagasi.reserbayan.config.JwtUtil;
import com.cagasi.reserbayan.dto.ResidentDTO;
import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.entity.Role;
import com.cagasi.reserbayan.entity.Status;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])[A-Za-z0-9\\S]{8,}$");

    private void validatePasswordStrength(String password) {
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new RuntimeException(
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character");
        }
    }

    public Admin registerAdmin(Admin admin, MultipartFile proofOfEmployment) throws IOException {
        // Validate password strength
        validatePasswordStrength(admin.getPassword());
        // Check if email already exists in resident table
        if (residentRepository.findByResidentEmail(admin.getResidentEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as resident");
        }
        // Check if email already exists in admin table
        if (adminRepository.findByResidentEmail(admin.getResidentEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as admin");
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        if (proofOfEmployment != null && !proofOfEmployment.isEmpty()) {
            String uploadDir = "uploads/admin/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + proofOfEmployment.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(proofOfEmployment.getInputStream(), filePath);
            admin.setProofOfEmploymentPath(filePath.toString());
        }

        return adminRepository.save(admin);
    }

    public Resident registerResident(Resident resident, MultipartFile validId) throws IOException {
        // Validate password strength
        validatePasswordStrength(resident.getPassword());
        // Check if email already exists in admin table
        if (adminRepository.findByResidentEmail(resident.getResidentEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as admin");
        }
        // Check if email already exists in resident table
        if (residentRepository.findByResidentEmail(resident.getResidentEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as resident");
        }
        resident.setPassword(passwordEncoder.encode(resident.getPassword()));

        if (validId != null && !validId.isEmpty()) {
            String uploadDir = "uploads/resident/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + validId.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(validId.getInputStream(), filePath);
            resident.setValidIdPath(filePath.toString());
        }

        return residentRepository.save(resident);
    }

    public Admin authenticateAdmin(String identifier, String password) {
        Admin admin = adminRepository.findByResidentEmail(identifier).orElse(null);
        if (admin == null) {
            admin = adminRepository.findByUsername(identifier).orElse(null);
        }
        if (admin != null && admin.getStatus() == Status.ACTIVE
                && passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        }
        return null;
    }

    public Resident authenticateResident(String email, String password) {
        Resident resident = residentRepository.findByResidentEmail(email).orElse(null);
        if (resident != null && (resident.getStatus() == ResidentStatus.APPROVED || resident.getStatus() == ResidentStatus.PENDING) && passwordEncoder.matches(password, resident.getPassword())) {
            return resident;
        }
        return null;
    }

    public java.util.Map<String, Object> authenticate(String identifier, String password) {
        // Check SuperAdmin first
        Admin superAdmin = authenticateAdmin(identifier, password);
        if (superAdmin != null && superAdmin.getRole() == Role.SUPER_ADMIN) {
            String token = jwtUtil.generateToken(identifier, "SUPER_ADMIN");
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", "SUPER_ADMIN");
            response.put("user", superAdmin);
            return response;
        }

        // Check Admin
        Admin admin = authenticateAdmin(identifier, password);
        if (admin != null && admin.getRole() == Role.ADMIN) {
            String token = jwtUtil.generateToken(identifier, "ADMIN");
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", "ADMIN");
            response.put("user", admin);
            return response;
        }

        // Check Resident
        Resident resident = authenticateResident(identifier, password);
        if (resident != null) {
            String token = jwtUtil.generateToken(identifier, "RESIDENT");
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", "RESIDENT");
            response.put("user", resident);
            return response;
        }

        return null;
    }

    public Resident updateProfile(Long residentId, ResidentDTO residentDTO) {
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        // Check if email is being changed and if it's already taken
        if (!resident.getResidentEmail().equals(residentDTO.getResidentEmail())) {
            if (adminRepository.findByResidentEmail(residentDTO.getResidentEmail()).isPresent()) {
                throw new RuntimeException("Email already registered as admin");
            }
            if (residentRepository.findByResidentEmail(residentDTO.getResidentEmail()).isPresent()) {
                throw new RuntimeException("Email already registered as resident");
            }
        }

        // Update fields
        resident.setFirstName(residentDTO.getFirstName());
        resident.setLastName(residentDTO.getLastName());
        resident.setMiddleName(residentDTO.getMiddleName());
        resident.setResidentEmail(residentDTO.getResidentEmail());
        resident.setPhoneNumber(residentDTO.getPhoneNumber());
        resident.setAddress(residentDTO.getAddress());
        resident.setBirthdate(residentDTO.getBirthdate());

        return residentRepository.save(resident);
    }
}