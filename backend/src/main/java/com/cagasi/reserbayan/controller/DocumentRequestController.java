package com.cagasi.reserbayan.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cagasi.reserbayan.dto.DocumentRequestDTO;
import com.cagasi.reserbayan.dto.DocumentRequestUpdateDTO;
import com.cagasi.reserbayan.entity.DocumentRequest;
import com.cagasi.reserbayan.entity.RequestAttachment;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.DocumentRequestRepository;
import com.cagasi.reserbayan.repository.RequestAttachmentRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;
import com.cagasi.reserbayan.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/document-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentRequestController {

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private RequestAttachmentRepository attachmentRepository;

    @Autowired
    private NotificationService notificationService;

    // Define the folder where files will be saved
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // CREATE new document request with attachments
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createRequest(
            @RequestParam("data") String requestData,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            DocumentRequestDTO dto = mapper.readValue(requestData, DocumentRequestDTO.class);

            Resident resident = residentRepository.findById(dto.getResidentId()).orElse(null);

            if (resident == null) {
                return ResponseEntity.badRequest().body("Resident not found");
            }

            if (resident.getStatus() == ResidentStatus.REJECTED) {
                return ResponseEntity.badRequest()
                        .body("Your account registration has been rejected. Please contact support or reapply with updated information.");
            } else if (resident.getStatus() == ResidentStatus.PENDING) {
                return ResponseEntity.badRequest()
                        .body("Your account has not been confirmed yet. Please wait for approval.");
            }

            DocumentRequest request = new DocumentRequest();
            request.setDocumentId(dto.getDocumentId());
            request.setDocumentName(dto.getDocumentName());
            request.setResident(resident);
            request.setDetails(dto.getDetails());
            request.setStatus("Pending");
            request.setSubmittedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());

            if (files != null && !files.isEmpty()) {
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                List<RequestAttachment> attachments = new ArrayList<>();

                for (MultipartFile file : files) {
                    if (file.isEmpty())
                        continue;

                    String uniqueFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

                    Files.write(filePath, file.getBytes());

                    RequestAttachment attachment = new RequestAttachment(
                            file.getOriginalFilename(),
                            file.getContentType(),
                            uniqueFileName,
                            request);
                    attachments.add(attachment);
                }
                request.setAttachments(attachments);
            }

            DocumentRequest saved = requestRepository.save(request);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error uploading files: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing request: " + e.getMessage());
        }
    }

    // UPDATE a request (Edit details, add/remove files)
    @PutMapping(value = "/{requestId}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateRequest(
            @PathVariable Long requestId,
            @RequestParam("data") String requestData,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        try {
            DocumentRequest request = requestRepository.findById(requestId).orElse(null);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            // --- FIX IS HERE: Used .getStatus() instead of .status ---
            if (!"Pending".equalsIgnoreCase(request.getStatus())) {
                return ResponseEntity.badRequest().body("You can only edit pending requests.");
            }

            ObjectMapper mapper = new ObjectMapper();
            DocumentRequestUpdateDTO dto = mapper.readValue(requestData, DocumentRequestUpdateDTO.class);

            request.setDetails(dto.getDetails());
            request.setUpdatedAt(LocalDateTime.now());

            if (dto.getFilesToRemove() != null && !dto.getFilesToRemove().isEmpty()) {
                Iterator<RequestAttachment> iterator = request.getAttachments().iterator();
                while (iterator.hasNext()) {
                    RequestAttachment att = iterator.next();
                    if (dto.getFilesToRemove().contains(att.getId())) {
                        try {
                            Path path = Paths.get(UPLOAD_DIR + att.getFilePath());
                            Files.deleteIfExists(path);
                        } catch (Exception e) {
                            System.err.println("Could not delete file: " + att.getFilePath());
                        }
                        iterator.remove();
                        attachmentRepository.delete(att);
                    }
                }
            }

            if (files != null && !files.isEmpty()) {
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists())
                    directory.mkdirs();

                for (MultipartFile file : files) {
                    if (file.isEmpty())
                        continue;

                    String uniqueFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
                    Files.write(filePath, file.getBytes());

                    RequestAttachment attachment = new RequestAttachment(
                            file.getOriginalFilename(),
                            file.getContentType(),
                            uniqueFileName,
                            request);
                    request.getAttachments().add(attachment);
                }
            }

            DocumentRequest saved = requestRepository.save(request);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating request: " + e.getMessage());
        }
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

        notificationService.createNotification(
                request.getResident(),
                "Document Request Approved",
                "Your request for '" + request.getDocumentName() + "' has been approved.",
                "REQUEST_APPROVED");

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

        notificationService.createNotification(
                request.getResident(),
                "Document Request Rejected",
                "Your request for '" + request.getDocumentName() + "' has been rejected.",
                "REQUEST_REJECTED");

        return ResponseEntity.ok(saved);
    }
}