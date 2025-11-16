package com.cagasi.reserbayan.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_requests")
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    // Save the documentId from your JSON file
    @Column(nullable = false)
    private String documentId;

    // Save the name from your JSON file
    @Column(nullable = false)
    private String documentName;

    // Who requested it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residentId", nullable = false)
    private Resident resident;

    // Purpose of request
    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    // Status (default: Pending)
    @Column(nullable = false)
    private String status = "Pending";

    private LocalDateTime submittedAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    // --- Getters and Setters ---

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public Resident getResident() {
        return resident;
    }

    public void setResident(Resident resident) {
        this.resident = resident;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
