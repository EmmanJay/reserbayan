package com.cagasi.reserbayan.dto;

import java.util.List;

public class DocumentRequestUpdateDTO {
    private String details;
    private List<Long> filesToRemove; // List of Attachment IDs to delete

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public List<Long> getFilesToRemove() {
        return filesToRemove;
    }

    public void setFilesToRemove(List<Long> filesToRemove) {
        this.filesToRemove = filesToRemove;
    }
}