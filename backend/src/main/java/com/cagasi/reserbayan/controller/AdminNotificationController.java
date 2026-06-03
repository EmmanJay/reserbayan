package com.cagasi.reserbayan.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Role;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.service.AdminNotificationService;

@RestController
@RequestMapping("/api/admin-notifications")
public class AdminNotificationController {

    @Autowired
    private AdminNotificationService adminNotificationService;

    @Autowired
    private AdminRepository adminRepository;

    private boolean hasAdminAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        Admin admin = adminRepository.findByUsername(username).orElse(null);
        if (admin == null) {
            admin = adminRepository.findByResidentEmail(username).orElse(null);
        }

        return admin != null && (admin.getRole() == Role.ADMIN || admin.getRole() == Role.SUPER_ADMIN);
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestParam(defaultValue = "all") String category) {
        if (!hasAdminAccess()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        return ResponseEntity.ok(adminNotificationService.getNotifications(category));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        if (!hasAdminAccess()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        adminNotificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        if (!hasAdminAccess()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        adminNotificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        if (!hasAdminAccess()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        adminNotificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllNotifications() {
        if (!hasAdminAccess()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        adminNotificationService.deleteAllNotifications();
        return ResponseEntity.ok().build();
    }
}
