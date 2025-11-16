package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByResidentEmail(String email);
}