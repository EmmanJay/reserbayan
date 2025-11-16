package com.cagasi.reserbayan.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "document_requests")
public class DocumentRequest {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long requestId;
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "typeId", nullable = false)
   private DocumentType documentType;
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "userId", nullable = false)
   private Resident resident;
   private String details;
   private String status;
   private LocalDateTime submittedAt = LocalDateTime.now();
   private LocalDateTime updatedAt;
   // Getters and Setters
   public Long getRequestId() {
       return requestId;
   }
   public void setRequestId(Long requestId) {
       this.requestId = requestId;
   }
   public DocumentType getDocumentType() {
       return documentType;
   }
   public void setDocumentType(DocumentType documentType) {
       this.documentType = documentType;
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