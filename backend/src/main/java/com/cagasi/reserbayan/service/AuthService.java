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
import com.cagasi.reserbayan.dto.RegisterRequest; // Make sure to import this!
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

    // ... registerAdmin remains the same ...
    public Admin registerAdmin(Admin admin, MultipartFile proofOfEmployment) throws IOException {
        validatePasswordStrength(admin.getPassword());
        if (residentRepository.findByResidentEmail(admin.getResidentEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as resident");
        }
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

    // --- UPDATED METHOD: Uses RegisterRequest DTO ---
    public Resident registerResident(RegisterRequest request, MultipartFile validId) throws IOException {

        // 1. Validate Password
        validatePasswordStrength(request.getPassword());

        // 2. Check if email exists
        if (adminRepository.findByResidentEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as admin");
        }
        if (residentRepository.findByResidentEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as resident");
        }

        // 3. Create Entity and Map Fields Manually
        Resident resident = new Resident();
        resident.setFirstName(request.getFirstName());
        resident.setLastName(request.getLastName());
        resident.setMiddleName(request.getMiddleName());
        resident.setResidentEmail(request.getEmail());
        resident.setPhoneNumber(request.getPhoneNumber());
        resident.setBirthdate(request.getBirthDate());

        // Map New Fields
        resident.setGender(request.getGender());
        resident.setRegion(request.getRegion());
        resident.setProvince(request.getProvince());
        resident.setCity(request.getCity());
        resident.setBarangay(request.getBarangay());
        resident.setSitio(request.getSitio());
        resident.setAddressLine1(request.getAddressLine1());

        // Encode Password
        resident.setPassword(passwordEncoder.encode(request.getPassword()));

        // 4. Handle File Upload
        if (validId != null && !validId.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + "/uploads/resident/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + validId.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(validId.getInputStream(), filePath);
            // Store relative path for web access, not absolute path
            resident.setValidIdPath("uploads/resident/" + fileName);
        }

        return residentRepository.save(resident);
    }

    // ... authenticate methods remain the same ...
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
        if (resident != null
                && (resident.getStatus() == ResidentStatus.APPROVED
                        || resident.getStatus() == ResidentStatus.PENDING
                        || resident.getStatus() == ResidentStatus.REJECTED)
                && passwordEncoder.matches(password, resident.getPassword())) {
            return resident;
        }
        return null;
    }

    public java.util.Map<String, Object> authenticate(String identifier, String password) {
        // ... (Keep existing authentication logic)
        Admin superAdmin = authenticateAdmin(identifier, password);
        if (superAdmin != null && superAdmin.getRole() == Role.SUPER_ADMIN) {
            String token = jwtUtil.generateToken(identifier, "SUPER_ADMIN");
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", "SUPER_ADMIN");
            response.put("user", superAdmin);
            return response;
        }

        Admin admin = authenticateAdmin(identifier, password);
        if (admin != null && admin.getRole() == Role.ADMIN) {
            String token = jwtUtil.generateToken(identifier, "ADMIN");
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("role", "ADMIN");
            response.put("user", admin);
            return response;
        }

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

    // --- UPDATED METHOD: Maps new fields from ResidentDTO ---
    public Resident updateProfile(Long residentId, ResidentDTO residentDTO) {
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

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
        resident.setBirthdate(residentDTO.getBirthdate());

        // --- NEW UPDATES ---
        resident.setGender(residentDTO.getGender());
        resident.setRegion(residentDTO.getRegion());
        resident.setProvince(residentDTO.getProvince());
        resident.setCity(residentDTO.getCity());
        resident.setBarangay(residentDTO.getBarangay());
        resident.setSitio(residentDTO.getSitio());
        resident.setAddressLine1(residentDTO.getAddressLine1());
        // -------------------

        return residentRepository.save(resident);
    }
}