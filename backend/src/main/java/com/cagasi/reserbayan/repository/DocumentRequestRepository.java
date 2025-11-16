package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {
    List<DocumentRequest> findByResident_ResidentId(Long residentId);
}
