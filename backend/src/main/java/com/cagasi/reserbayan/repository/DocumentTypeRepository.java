package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    Optional<DocumentType> findByDocumentId(String documentId);
}