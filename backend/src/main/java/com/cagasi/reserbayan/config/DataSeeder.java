package com.cagasi.reserbayan.config;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Role;
import com.cagasi.reserbayan.entity.Status;
import com.cagasi.reserbayan.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.findByUsername("superadmin").isEmpty()) {
            Admin superAdmin = new Admin();
            superAdmin.setUsername("superadmin");
            superAdmin.setResidentEmail("superadmin@reserbayan.gov");
            superAdmin.setPassword(passwordEncoder.encode("SuperAdmin123!"));
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setStatus(Status.ACTIVE);
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            adminRepository.save(superAdmin);
            System.out.println("SuperAdmin account created.");
        }
    }
}