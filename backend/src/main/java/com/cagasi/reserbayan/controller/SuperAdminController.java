package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.entity.*;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        List<Resident> residents = residentRepository.findAll().stream()
            .filter(r -> r.getStatus() == ResidentStatus.APPROVED)
            .toList();
        return ResponseEntity.ok(residents);
    }

    @GetMapping("/residents/{id}")
    public ResponseEntity<?> getResidentById(@PathVariable Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resident);
    }

    @DeleteMapping("/residents/{id}")
    public ResponseEntity<?> deleteResident(@PathVariable Long id) {
        if (!residentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        residentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/residents/{id}/password")
    public ResponseEntity<?> resetResidentPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return ResponseEntity.notFound().build();
        }
        resident.setPassword(request.get("password"));
        residentRepository.save(resident);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/residents/{id}/verify")
    public ResponseEntity<?> verifyResident(@PathVariable Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return ResponseEntity.notFound().build();
        }
        // Assuming there's a verification status or field, for now just update status to APPROVED
        resident.setStatus(ResidentStatus.APPROVED);
        residentRepository.save(resident);
        return ResponseEntity.ok(resident);
    }

    @GetMapping("/residents/{id}/password")
    public ResponseEntity<?> getResidentPassword(@PathVariable Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("password", resident.getPassword() != null ? resident.getPassword() : "Not set"));
    }

    // Resident Requests Management
    @GetMapping("/resident-requests")
    public ResponseEntity<?> getResidentRequests() {
        List<Resident> requests = residentRepository.findAll().stream()
            .filter(r -> r.getStatus() == ResidentStatus.PENDING)
            .toList();
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/resident-requests/{id}/approve")
    public ResponseEntity<?> approveResidentRequest(@PathVariable Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null || resident.getStatus() != ResidentStatus.PENDING) {
            return ResponseEntity.notFound().build();
        }
        resident.setStatus(ResidentStatus.APPROVED);
        residentRepository.save(resident);
        return ResponseEntity.ok(resident);
    }

    @PutMapping("/resident-requests/{id}/reject")
    public ResponseEntity<?> rejectResidentRequest(@PathVariable Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null || resident.getStatus() != ResidentStatus.PENDING) {
            return ResponseEntity.notFound().build();
        }
        resident.setStatus(ResidentStatus.REJECTED);
        residentRepository.save(resident);
        return ResponseEntity.ok(resident);
    }

    // Admin Management
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            if (admin.getPlainPassword() == null) {
                if (admin.getRole() == Role.SUPER_ADMIN) {
                    admin.setPlainPassword("SuperAdmin123!");
                } else {
                    admin.setPlainPassword("Admin123");
                }
            }
            // Encode password if not already encoded
            if (admin.getPassword() != null && !admin.getPassword().startsWith("$2a")) {
                admin.setPassword(passwordEncoder.encode(admin.getPassword()));
                adminRepository.save(admin);
            }
        }
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/admins/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(admin);
    }

    @PostMapping("/admins")
    public ResponseEntity<?> addAdmin(@RequestBody Admin admin) {
        try {
            String plainPassword = admin.getPlainPassword();
            if (plainPassword == null || plainPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }
            admin.setPlainPassword(plainPassword);
            admin.setPassword(passwordEncoder.encode(plainPassword));
            Admin saved = adminRepository.save(admin);
            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username or email already exists");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add admin: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        Admin existing = adminRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setFirstName(admin.getFirstName());
        existing.setLastName(admin.getLastName());
        existing.setMiddleName(admin.getMiddleName());
        existing.setResidentEmail(admin.getResidentEmail());
        existing.setUsername(admin.getUsername());
        existing.setPhoneNumber(admin.getPhoneNumber());
        existing.setAddress(admin.getAddress());
        existing.setPosition(admin.getPosition());
        existing.setProofOfEmploymentPath(admin.getProofOfEmploymentPath());
        // Update password if changed
        if (admin.getPassword() != null && !admin.getPassword().equals(existing.getPlainPassword())) {
            existing.setPlainPassword(admin.getPassword());
            existing.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        Admin saved = adminRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/admins/{id}/status")
    public ResponseEntity<?> toggleAdminStatus(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }
        admin.setStatus(admin.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        Admin saved = adminRepository.save(admin);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/admins/{id}/role")
    public ResponseEntity<?> makeSuperAdmin(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }
        admin.setRole(Role.SUPER_ADMIN);
        Admin saved = adminRepository.save(admin);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        if (!adminRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        adminRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admins/{id}/password")
    public ResponseEntity<?> resetAdminPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Admin admin = adminRepository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }
        admin.setPassword(request.get("password"));
        adminRepository.save(admin);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifySuperAdminPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Password is required"));
        }

        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Not authenticated"));
        }

        String username = authentication.getName();

        // Find the admin by username or email
        Admin currentAdmin = adminRepository.findByUsername(username).orElse(null);
        if (currentAdmin == null) {
            currentAdmin = adminRepository.findByResidentEmail(username).orElse(null);
        }

        if (currentAdmin == null || currentAdmin.getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("valid", false, "message", "Super admin access required"));
        }

        // Verify the password using the password encoder
        boolean isValid = passwordEncoder.matches(password, currentAdmin.getPassword());

        return ResponseEntity.ok(Map.of("valid", isValid));
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