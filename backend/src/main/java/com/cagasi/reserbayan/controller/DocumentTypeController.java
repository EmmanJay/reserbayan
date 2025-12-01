package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.dto.DocumentTypeDTO;
import com.cagasi.reserbayan.entity.DocumentType;
import com.cagasi.reserbayan.repository.DocumentTypeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/document-types")
public class DocumentTypeController {

    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<List<DocumentTypeDTO>> getAllDocumentTypes() {
        List<DocumentType> documentTypes = documentTypeRepository.findAll().stream()
                .filter(DocumentType::isActive)
                .collect(Collectors.toList());

        List<DocumentTypeDTO> dtos = documentTypes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentTypeDTO> getDocumentTypeById(@PathVariable Long id) {
        Optional<DocumentType> documentType = documentTypeRepository.findById(id);
        if (documentType.isPresent() && documentType.get().isActive()) {
            DocumentTypeDTO dto = convertToDTO(documentType.get());
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<DocumentTypeDTO> createDocumentType(@RequestBody DocumentTypeDTO dto) {
        DocumentType entity = convertToEntity(dto);
        entity.setActive(true);
        DocumentType saved = documentTypeRepository.save(entity);
        DocumentTypeDTO responseDto = convertToDTO(saved);
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentTypeDTO> updateDocumentType(@PathVariable Long id, @RequestBody DocumentTypeDTO dto) {
        Optional<DocumentType> existing = documentTypeRepository.findById(id);
        if (existing.isPresent()) {
            DocumentType entity = existing.get();
            updateEntityFromDTO(entity, dto);
            DocumentType saved = documentTypeRepository.save(entity);
            DocumentTypeDTO responseDto = convertToDTO(saved);
            return ResponseEntity.ok(responseDto);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocumentType(@PathVariable Long id) {
        Optional<DocumentType> documentType = documentTypeRepository.findById(id);
        if (documentType.isPresent()) {
            DocumentType entity = documentType.get();
            entity.setActive(false);
            documentTypeRepository.save(entity);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return the file path (relative to serve static files)
            String fileUrl = "/uploads/" + filename;
            return ResponseEntity.ok(fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file");
        }
    }

    private DocumentTypeDTO convertToDTO(DocumentType entity) {
        DocumentTypeDTO dto = new DocumentTypeDTO();
        dto.setTypeId(entity.getTypeId());
        dto.setId(entity.getDocumentId());
        dto.setName(entity.getDocumentName());
        dto.setShortDescription(entity.getShortDescription());
        dto.setImagePath(entity.getImagePath());

        DocumentTypeDTO.Details details = new DocumentTypeDTO.Details();
        details.setCategory(entity.getCategory());
        details.setLongDescription(entity.getLongDescription());
        details.setProcessingTime(entity.getProcessingTime());
        details.setPdfPath(entity.getPdfPath());

        try {
            if (entity.getRequirements() != null) {
                List<String> requirements = objectMapper.readValue(entity.getRequirements(), new TypeReference<List<String>>() {});
                details.setRequirements(requirements);
            }
            if (entity.getUses() != null) {
                List<String> uses = objectMapper.readValue(entity.getUses(), new TypeReference<List<String>>() {});
                details.setUses(uses);
            }
        } catch (Exception e) {
            // Handle JSON parsing error
            e.printStackTrace();
        }

        dto.setDetails(details);
        return dto;
    }

    private DocumentType convertToEntity(DocumentTypeDTO dto) {
        DocumentType entity = new DocumentType();
        entity.setDocumentId(dto.getId());
        entity.setDocumentName(dto.getName());
        entity.setShortDescription(dto.getShortDescription());
        entity.setImagePath(dto.getImagePath());

        if (dto.getDetails() != null) {
            entity.setCategory(dto.getDetails().getCategory());
            entity.setLongDescription(dto.getDetails().getLongDescription());
            entity.setProcessingTime(dto.getDetails().getProcessingTime());
            entity.setPdfPath(dto.getDetails().getPdfPath());

            try {
                if (dto.getDetails().getRequirements() != null) {
                    entity.setRequirements(objectMapper.writeValueAsString(dto.getDetails().getRequirements()));
                }
                if (dto.getDetails().getUses() != null) {
                    entity.setUses(objectMapper.writeValueAsString(dto.getDetails().getUses()));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return entity;
    }

    private void updateEntityFromDTO(DocumentType entity, DocumentTypeDTO dto) {
        if (dto.getId() != null) entity.setDocumentId(dto.getId());
        if (dto.getName() != null) entity.setDocumentName(dto.getName());
        if (dto.getShortDescription() != null) entity.setShortDescription(dto.getShortDescription());
        if (dto.getImagePath() != null) entity.setImagePath(dto.getImagePath());

        if (dto.getDetails() != null) {
            if (dto.getDetails().getCategory() != null) entity.setCategory(dto.getDetails().getCategory());
            if (dto.getDetails().getLongDescription() != null) entity.setLongDescription(dto.getDetails().getLongDescription());
            if (dto.getDetails().getProcessingTime() != null) entity.setProcessingTime(dto.getDetails().getProcessingTime());
            if (dto.getDetails().getPdfPath() != null) entity.setPdfPath(dto.getDetails().getPdfPath());

            try {
                if (dto.getDetails().getRequirements() != null) {
                    entity.setRequirements(objectMapper.writeValueAsString(dto.getDetails().getRequirements()));
                }
                if (dto.getDetails().getUses() != null) {
                    entity.setUses(objectMapper.writeValueAsString(dto.getDetails().getUses()));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}