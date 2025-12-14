package com.cagasi.reserbayan.dto;

import com.cagasi.reserbayan.entity.Announcement;
import java.time.LocalDateTime;

public class AnnouncementDTO {

    private Long announcementId;
    private String title;
    private String content;
    private String postedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Announcement.Priority priority;
    private Boolean isVisible;

    public AnnouncementDTO() {
    }

    public AnnouncementDTO(Announcement announcement) {
        this.announcementId = announcement.getAnnouncementId();
        this.title = announcement.getTitle();
        this.content = announcement.getContent();
        this.postedBy = announcement.getPostedBy();
        this.createdAt = announcement.getCreatedAt();
        this.updatedAt = announcement.getUpdatedAt();
        this.isActive = announcement.getIsActive();
        this.startDate = announcement.getStartDate();
        this.endDate = announcement.getEndDate();
        this.priority = announcement.getPriority();
        this.isVisible = announcement.getIsVisible();
    }

    // Getters and Setters
    public Long getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Announcement.Priority getPriority() {
        return priority;
    }

    public void setPriority(Announcement.Priority priority) {
        this.priority = priority;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }
}