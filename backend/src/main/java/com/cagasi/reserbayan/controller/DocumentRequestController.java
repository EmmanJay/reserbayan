package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.dto.DocumentRequestDTO;
import com.cagasi.reserbayan.entity.DocumentRequest;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.DocumentRequestRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/document-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentRequestController {

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private ResidentRepository residentRepository;

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
}
