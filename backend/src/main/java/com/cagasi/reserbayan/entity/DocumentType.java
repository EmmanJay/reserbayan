package com.cagasi.reserbayan.entity;
import jakarta.persistence.*;
import java.util.List;
@Entity
@Table(name = "document_types")
public class DocumentType {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long typeId;
   private String documentName;
   private String description;
   private int processingDays;
   private boolean isActive;
   private String department;
   @OneToMany(mappedBy = "documentType", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<DocumentRequest> documentRequests;
   // Getters and Setters
   public Long getTypeId() {
       return typeId;
   }
   public void setTypeId(Long typeId) {
       this.typeId = typeId;
   }
   public String getDocumentName() {
       return documentName;
   }
   public void setDocumentName(String documentName) {
       this.documentName = documentName;
   }
   public String getDescription() {
       return description;
   }
   public void setDescription(String description) {
       this.description = description;
   }
   public int getProcessingDays() {
       return processingDays;
   }
   public void setProcessingDays(int processingDays) {
       this.processingDays = processingDays;
   }
   public boolean isActive() {
       return isActive;
   }
   public void setActive(boolean active) {
       isActive = active;
   }
   public String getDepartment() {
       return department;
   }
   public void setDepartment(String department) {
       this.department = department;
   }
   public List<DocumentRequest> getDocumentRequests() {
       return documentRequests;
   }
   public void setDocumentRequests(List<DocumentRequest> documentRequests) {
       this.documentRequests = documentRequests;
   }
}