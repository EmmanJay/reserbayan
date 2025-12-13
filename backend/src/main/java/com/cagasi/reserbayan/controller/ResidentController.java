package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.entity.Announcement;
import com.cagasi.reserbayan.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    @Autowired
    private AnnouncementService announcementService;

    // Get all active announcements for residents
    @GetMapping("/announcements")
    public ResponseEntity<?> getActiveAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.getAllActiveAnnouncements();
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch announcements: " + e.getMessage());
        }
    }

    // Get a specific announcement by ID (for detailed view)
    @GetMapping("/announcements/{id}")
    public ResponseEntity<?> getAnnouncementById(@PathVariable Long id) {
        try {
            return announcementService.getAnnouncementById(id)
                    .map(announcement -> {
                        // Only return active announcements to residents
                        if (announcement.getIsActive()) {
                            return ResponseEntity.ok(announcement);
                        } else {
                            return ResponseEntity.notFound().build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch announcement: " + e.getMessage());
        }
    }
}