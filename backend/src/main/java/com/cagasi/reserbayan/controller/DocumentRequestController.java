package com.cagasi.reserbayan.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cagasi.reserbayan.dto.DocumentRequestDTO;
import com.cagasi.reserbayan.entity.DocumentRequest;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.DocumentRequestRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;
import com.cagasi.reserbayan.service.NotificationService;

@RestController
@RequestMapping("/api/document-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentRequestController {

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private NotificationService notificationService;

    // CREATE new document request
    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody DocumentRequestDTO dto) {

        Resident resident = residentRepository.findById(dto.getResidentId()).orElse(null);

        if (resident == null) {
            return ResponseEntity.badRequest().body("Resident not found");
        }

        if (resident.getStatus() != ResidentStatus.APPROVED) {
            return ResponseEntity.badRequest().body("Your account has not been confirmed yet. Please wait for approval.");
        }

        DocumentRequest request = new DocumentRequest();
        request.setDocumentId(dto.getDocumentId());
        request.setDocumentName(dto.getDocumentName());
        request.setResident(resident);
        request.setDetails(dto.getDetails());
        request.setStatus("Pending");
        request.setSubmittedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        DocumentRequest saved = requestRepository.save(request);

        return ResponseEntity.ok(saved);
    }

    // GET all requests made by a resident
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<?> getRequestsByResident(@PathVariable Long residentId) {
        List<DocumentRequest> requests = requestRepository.findByResident_ResidentId(residentId);
        return ResponseEntity.ok(requests);
    }

    // GET all requests (Admin view)
    @GetMapping
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(requestRepository.findAll());
    }

    // CANCEL a request
    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long requestId) {
        DocumentRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending requests can be cancelled");
        }
        request.setStatus("Cancelled");
        request.setUpdatedAt(LocalDateTime.now());
        DocumentRequest saved = requestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    // APPROVE a request
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        DocumentRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending requests can be approved");
        }
        request.setStatus("Approved");
        request.setUpdatedAt(LocalDateTime.now());
        DocumentRequest saved = requestRepository.save(request);

        // Create notification for the resident
        notificationService.createNotification(
            request.getResident(),
            "Document Request Approved",
            "Your request for '" + request.getDocumentName() + "' has been approved.",
            "REQUEST_APPROVED"
        );

        return ResponseEntity.ok(saved);
    }

    // REJECT a request
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        DocumentRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending requests can be rejected");
        }
        request.setStatus("Rejected");
        request.setUpdatedAt(LocalDateTime.now());
        DocumentRequest saved = requestRepository.save(request);

        // Create notification for the resident
        notificationService.createNotification(
            request.getResident(),
            "Document Request Rejected",
            "Your request for '" + request.getDocumentName() + "' has been rejected.",
            "REQUEST_REJECTED"
        );

        return ResponseEntity.ok(saved);
    }
}
