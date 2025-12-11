package com.cagasi.reserbayan.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cagasi.reserbayan.dto.RegisterRequest; // IMPORT THIS!
import com.cagasi.reserbayan.dto.ResidentDTO;
import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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