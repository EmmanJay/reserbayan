package com.cagasi.reserbayan.service;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin registerAdmin(Admin admin, MultipartFile proofOfEmployment) throws IOException {
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