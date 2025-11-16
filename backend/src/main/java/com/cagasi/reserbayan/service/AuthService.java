package com.cagasi.reserbayan.service;

import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
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

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    private void validatePasswordStrength(String password) {
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new RuntimeException("Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character (@$!%*?&)");
        }
    }

    public Admin registerAdmin(Admin admin) {
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

    public Resident registerResident(Resident resident) {
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

    public Admin authenticateAdmin(String email, String password) {
        Admin admin = adminRepository.findByResidentEmail(email).orElse(null);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        }
        return null;
    }

    public Resident authenticateResident(String email, String password) {
        Resident resident = residentRepository.findByResidentEmail(email).orElse(null);
        if (resident != null && passwordEncoder.matches(password, resident.getPassword())) {
            return resident;
        }
        return null;
    }
}