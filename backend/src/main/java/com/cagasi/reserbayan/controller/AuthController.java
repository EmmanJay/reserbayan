package com.cagasi.reserbayan.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cagasi.reserbayan.dto.RegisterRequest; // IMPORT THIS!
import com.cagasi.reserbayan.dto.ResidentDTO;
import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.ResidentRepository;
import com.cagasi.reserbayan.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ResidentRepository residentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> authResult = authService.authenticate(loginRequest.getIdentifier(),
                loginRequest.getPassword());

        if (authResult != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", authResult.get("token"));
            response.put("role", authResult.get("role"));
            response.put("user", authResult.get("user"));
            return ResponseEntity.ok(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid credentials");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@ModelAttribute RegisterRequest registerRequest) throws IOException {
        Map<String, Object> response = new HashMap<>();

        try {
            // NOTE: Ensure your RegisterRequest.java DTO has a 'userType' field and getter!
            // If you missed adding it in the DTO step, add: private String userType;

            if ("admin".equals(registerRequest.getUserType())) {
                // --- ADMIN LOGIC (Legacy Mapping) ---
                // Since Admin entity likely still has a single 'address' field, we construct it
                // manually
                Admin admin = new Admin();
                admin.setFirstName(registerRequest.getFirstName());
                admin.setLastName(registerRequest.getLastName());
                admin.setMiddleName(registerRequest.getMiddleName());
                admin.setResidentEmail(registerRequest.getEmail());
                admin.setPassword(registerRequest.getPassword());
                admin.setPhoneNumber(registerRequest.getPhoneNumber());

                // Concatenate new address fields for Admin
                String fullAddress = registerRequest.getAddressLine1() + ", " +
                        registerRequest.getBarangay() + ", " +
                        registerRequest.getCity();
                admin.setAddress(fullAddress);

                // Admin registration uses the old style (Entity + File)
                Admin savedAdmin = authService.registerAdmin(admin, registerRequest.getProofOfEmployment());

                response.put("success", true);
                response.put("user", savedAdmin);
                return ResponseEntity.ok(response);

            } else {
                // --- RESIDENT LOGIC (New Efficient Mapping) ---

                // We NO LONGER manually map fields here (e.g. resident.setFirstName...)
                // We pass the whole DTO to the service.
                Resident savedResident = authService.registerResident(registerRequest, registerRequest.getValidId());

                response.put("success", true);
                response.put("user", savedResident);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ResidentDTO residentDTO) {
        Map<String, Object> response = new HashMap<>();

        try {
            Resident updatedResident = authService.updateProfile(residentDTO.getResidentId(), residentDTO);
            response.put("success", true);
            response.put("user", updatedResident);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Profile update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(value = "/resubmit", consumes = { "multipart/form-data" })
    public ResponseEntity<?> resubmitProfile(@ModelAttribute RegisterRequest registerRequest,
            HttpServletRequest request) throws IOException {
        Map<String, Object> response = new HashMap<>();

        try {
            // Basic authentication check - ensure we have a valid token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Find the existing resident by resident ID
            Long residentId = registerRequest.getResidentId();
            System.out.println("Received residentId: " + residentId);

            if (residentId == null) {
                response.put("success", false);
                response.put("message", "Resident ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            Resident existingResident = residentRepository.findById(residentId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            // Update the resident information
            existingResident.setFirstName(registerRequest.getFirstName());
            existingResident.setLastName(registerRequest.getLastName());
            existingResident.setMiddleName(registerRequest.getMiddleName());
            existingResident.setResidentEmail(registerRequest.getEmail());
            existingResident.setPhoneNumber(registerRequest.getPhoneNumber());
            existingResident.setBirthdate(registerRequest.getBirthDate());
            existingResident.setGender(registerRequest.getGender());
            existingResident.setRegion(registerRequest.getRegion());
            existingResident.setProvince(registerRequest.getProvince());
            existingResident.setCity(registerRequest.getCity());
            existingResident.setBarangay(registerRequest.getBarangay());
            existingResident.setSitio(registerRequest.getSitio());
            existingResident.setAddressLine1(registerRequest.getAddressLine1());

            // Reset status to PENDING for resubmission
            existingResident.setStatus(ResidentStatus.PENDING);

            // Handle file upload if provided
            if (registerRequest.getValidId() != null && !registerRequest.getValidId().isEmpty()) {
                MultipartFile validIdFile = registerRequest.getValidId();

                // Validate file type
                String contentType = validIdFile.getContentType();
                if (contentType != null && (contentType.equals("application/pdf") ||
                        contentType.startsWith("image/") ||
                        contentType.equals("image/jpeg") ||
                        contentType.equals("image/jpg") ||
                        contentType.equals("image/png"))) {
                    try {
                        // Delete old file if exists
                        if (existingResident.getValidIdPath() != null && !existingResident.getValidIdPath().isEmpty()) {
                            try {
                                java.nio.file.Path oldFilePath = java.nio.file.Paths
                                        .get(existingResident.getValidIdPath());
                                if (java.nio.file.Files.exists(oldFilePath)) {
                                    java.nio.file.Files.delete(oldFilePath);
                                }
                            } catch (Exception e) {
                                // Log error but continue
                                System.err.println("Error deleting old file: " + e.getMessage());
                            }
                        }

                        // Save new file
                        String uploadDir = System.getProperty("user.dir") + "/uploads/resident/";
                        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                        if (!java.nio.file.Files.exists(uploadPath)) {
                            java.nio.file.Files.createDirectories(uploadPath);
                        }
                        String fileName = java.util.UUID.randomUUID().toString() + "_"
                                + validIdFile.getOriginalFilename();
                        java.nio.file.Path filePath = uploadPath.resolve(fileName);
                        java.nio.file.Files.copy(validIdFile.getInputStream(), filePath,
                                java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                        // Store relative path for web access, not absolute path
                        existingResident.setValidIdPath("uploads/resident/" + fileName);
                    } catch (IOException e) {
                        response.put("success", false);
                        response.put("message", "Failed to save file: " + e.getMessage());
                        return ResponseEntity.badRequest().body(response);
                    }
                } else {
                    response.put("success", false);
                    response.put("message", "Invalid file type. Only PDF and image files are allowed.");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            Resident updatedResident = residentRepository.save(existingResident);

            response.put("success", true);
            response.put("user", updatedResident);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Resubmission failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Keep LoginRequest inner class if you prefer, or move to DTO package
    public static class LoginRequest {
        private String identifier;
        private String password;

        public String getIdentifier() {
            return identifier;
        }

        public void setIdentifier(String identifier) {
            this.identifier = identifier;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}