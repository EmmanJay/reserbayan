package com.cagasi.reserbayan.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_logs")
public class StatusLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long statusId;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private DocumentRequest documentRequest;

    @ManyToOne
    @JoinColumn(name = "admin_id")

    private Admin admin;
    private String status;
    private String changedBy;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String notes;

    // Getters and setters

    public Long getStatusId() {
        return statusId;
    }
    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }
    public DocumentRequest getDocumentRequest() {
        return documentRequest;
    }
    public void setDocumentRequest(DocumentRequest documentRequest) {
        this.documentRequest = documentRequest;
    }
    public Admin getAdmin() {
        return admin;
    }
    public void setAdmin(Admin admin) {
        this.admin = admin;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getChangedBy() {
        return changedBy;
    }
    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
 