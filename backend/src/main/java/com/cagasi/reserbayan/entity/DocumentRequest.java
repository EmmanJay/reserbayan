package com.cagasi.reserbayan.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

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
    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    // Purpose of request
    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    // Status (default: Pending)
    @Column(nullable = false)
    private String status = "Pending";

    // Rejection reason field
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime submittedAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    // --- NEW: Relationship to Attachments ---
    @OneToMany(mappedBy = "documentRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestAttachment> attachments = new ArrayList<>();

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

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
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

    public List<RequestAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<RequestAttachment> attachments) {
        this.attachments = attachments;
    }
}