package com.cagasi.reserbayan.service;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin registerAdmin(Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }

    public Resident registerResident(Resident resident) {
        resident.setPassword(passwordEncoder.encode(resident.getPassword()));
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