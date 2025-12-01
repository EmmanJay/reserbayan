package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.dto.DocumentTypeDTO;
import com.cagasi.reserbayan.entity.DocumentType;
import com.cagasi.reserbayan.repository.DocumentTypeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
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

    private DocumentTypeDTO convertToDTO(DocumentType entity) {
        DocumentTypeDTO dto = new DocumentTypeDTO();
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
}