package com.cagasi.reserbayan.service;

import com.cagasi.reserbayan.entity.Announcement;
import com.cagasi.reserbayan.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // Get all active announcements
    public List<Announcement> getAllActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    // Get all announcements (for admin use)
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get announcement by ID
    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    // Create new announcement
    public Announcement createAnnouncement(String title, String content, String postedBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setPostedBy(postedBy);
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setIsActive(true);

        return announcementRepository.save(announcement);
    }

    // Update existing announcement
    public Optional<Announcement> updateAnnouncement(Long id, String title, String content) {
        Optional<Announcement> existingAnnouncement = announcementRepository.findById(id);

        if (existingAnnouncement.isPresent()) {
            Announcement announcement = existingAnnouncement.get();
            announcement.setTitle(title);
            announcement.setContent(content);
            announcement.setUpdatedAt(LocalDateTime.now());

            return Optional.of(announcementRepository.save(announcement));
        }

        return Optional.empty();
    }

    // Deactivate announcement (soft delete)
    public boolean deactivateAnnouncement(Long id) {
        Optional<Announcement> existingAnnouncement = announcementRepository.findById(id);

        if (existingAnnouncement.isPresent()) {
            Announcement announcement = existingAnnouncement.get();
            announcement.setIsActive(false);
            announcement.setUpdatedAt(LocalDateTime.now());
            announcementRepository.save(announcement);
            return true;
        }

        return false;
    }

    // Permanently delete announcement
    public boolean deleteAnnouncement(Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Get announcement summary for dashboard
    public Map<String, Object> getAnnouncementSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAnnouncements", announcementRepository.count());
        summary.put("activeAnnouncements", announcementRepository.countActiveAnnouncements());
        return summary;
    }
}