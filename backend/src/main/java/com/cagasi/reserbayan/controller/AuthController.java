package com.cagasi.reserbayan.controller;

import java.io.IOException;
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
import org.springframework.web.multipart.MultipartFile;

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
        Map<String, Object> authResult = authService.authenticate(loginRequest.getIdentifier(), loginRequest.getPassword());
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
            if ("admin".equals(registerRequest.getUserType())) {
                Admin admin = new Admin();
                admin.setFirstName(registerRequest.getFirstName());
                admin.setLastName(registerRequest.getLastName());
                admin.setMiddleName(registerRequest.getMiddleName());
                admin.setResidentEmail(registerRequest.getEmail());
                admin.setPassword(registerRequest.getPassword());
                admin.setPhoneNumber(registerRequest.getPhoneNumber());
                admin.setAddress(registerRequest.getAddress());

                Admin savedAdmin = authService.registerAdmin(admin, registerRequest.getProofOfEmployment());
                response.put("success", true);
                response.put("user", savedAdmin);
                return ResponseEntity.ok(response);
            } else {
                Resident resident = new Resident();
                resident.setFirstName(registerRequest.getFirstName());
                resident.setLastName(registerRequest.getLastName());
                resident.setMiddleName(registerRequest.getMiddleName());
                resident.setResidentEmail(registerRequest.getEmail());
                resident.setPassword(registerRequest.getPassword());
                resident.setPhoneNumber(registerRequest.getPhoneNumber());
                resident.setAddress(registerRequest.getAddress());

                Resident savedResident = authService.registerResident(resident, registerRequest.getValidId());
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

    public static class RegisterRequest {
        private String userType;
        private String firstName;
        private String lastName;
        private String middleName;
        private String email;
        private String password;
        private String phoneNumber;
        private String address;
        private MultipartFile validId;
        private MultipartFile proofOfEmployment;

        // getters and setters
        public String getUserType() {
            return userType;
        }

        public void setUserType(String userType) {
            this.userType = userType;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getMiddleName() {
            return middleName;
        }

        public void setMiddleName(String middleName) {
            this.middleName = middleName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public MultipartFile getValidId() {
            return validId;
        }

        public void setValidId(MultipartFile validId) {
            this.validId = validId;
        }

        public MultipartFile getProofOfEmployment() {
            return proofOfEmployment;
        }

        public void setProofOfEmployment(MultipartFile proofOfEmployment) {
            this.proofOfEmployment = proofOfEmployment;
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ResidentDTO residentDTO) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get resident ID from JWT token or session, but for now assume it's in the DTO
            // In a real app, you'd extract from security context
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
}