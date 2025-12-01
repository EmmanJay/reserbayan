package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.entity.*;
import com.cagasi.reserbayan.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private DocumentRequestRepository documentRequestRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    @Autowired
    private StatusLogRepository statusLogRepository;

    // Summary & Analytics
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalResidents", residentRepository.count());
        summary.put("totalRequests", documentRequestRepository.count());
        // Add more analytics as needed
        return ResponseEntity.ok(summary);
    }

    // Request Management
    @GetMapping("/requests")
    public ResponseEntity<?> getAllRequests() {
        List<DocumentRequest> requests = documentRequestRepository.findAll();
        return ResponseEntity.ok(requests);
    }

    // Resident Management
    @GetMapping("/residents")
    public ResponseEntity<?> getAllResidents() {
        List<Resident> residents = residentRepository.findAll();
        return ResponseEntity.ok(residents);
    }

    // Admin Management
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return ResponseEntity.ok(admins);
    }

    @PostMapping("/admins")
    public ResponseEntity<?> addAdmin(@RequestBody Admin admin) {
        Admin saved = adminRepository.save(admin);
        return ResponseEntity.ok(saved);
    }

    // Document Types Management
    @GetMapping("/document-types")
    public ResponseEntity<?> getAllDocumentTypes() {
        List<DocumentType> types = documentTypeRepository.findAll();
        return ResponseEntity.ok(types);
    }

    @PostMapping("/document-types")
    public ResponseEntity<?> addDocumentType(@RequestBody DocumentType type) {
        DocumentType saved = documentTypeRepository.save(type);
        return ResponseEntity.ok(saved);
    }

    // System Logs
    @GetMapping("/logs")
    public ResponseEntity<?> getSystemLogs() {
        List<StatusLog> logs = statusLogRepository.findAll();
        return ResponseEntity.ok(logs);
    }

    // Barangay Settings - placeholder
    @GetMapping("/settings")
    public ResponseEntity<?> getBarangaySettings() {
        Map<String, String> settings = new HashMap<>();
        settings.put("barangayName", "Sample Barangay");
        settings.put("address", "Sample Address");
        return ResponseEntity.ok(settings);
    }
}