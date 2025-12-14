package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.RequestAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestAttachmentRepository extends JpaRepository<RequestAttachment, Long> {
    List<RequestAttachment> findByDocumentRequest_RequestId(Long requestId);
}