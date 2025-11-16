package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Optional<Resident> findByResidentEmail(String email);
}