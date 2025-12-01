package com.cagasi.reserbayan.service;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find as admin by username or email
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return User.builder()
                    .username(admin.getUsername() != null ? admin.getUsername() : admin.getResidentEmail())
                    .password(admin.getPassword())
                    .roles(admin.getRole().name())
                    .build();
        }

        adminOpt = adminRepository.findByResidentEmail(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return User.builder()
                    .username(admin.getResidentEmail())
                    .password(admin.getPassword())
                    .roles(admin.getRole().name())
                    .build();
        }

        // Try to find as resident by email
        Optional<Resident> residentOpt = residentRepository.findByResidentEmail(username);
        if (residentOpt.isPresent()) {
            Resident resident = residentOpt.get();
            return User.builder()
                    .username(resident.getResidentEmail())
                    .password(resident.getPassword())
                    .roles("RESIDENT")
                    .build();
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}