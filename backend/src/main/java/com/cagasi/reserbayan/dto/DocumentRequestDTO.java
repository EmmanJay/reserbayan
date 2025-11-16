package com.cagasi.reserbayan.dto;

public class DocumentRequestDTO {

    private String documentId; // from your JSON file
    private String documentName; // from your JSON file
    private Long residentId; // from logged-in user
    private String details; // purpose

    // Getters & Setters

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

    public Long getResidentId() {
        return residentId;
    }

    public void setResidentId(Long residentId) {
        this.residentId = residentId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
