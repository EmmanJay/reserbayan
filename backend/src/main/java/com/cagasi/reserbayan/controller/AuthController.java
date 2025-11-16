package com.cagasi.reserbayan.controller;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();

        // Try admin login first
        Admin admin = authService.authenticateAdmin(loginRequest.getEmail(), loginRequest.getPassword());
        if (admin != null) {
            response.put("success", true);
            response.put("user", admin);
            response.put("userType", "admin");
            return ResponseEntity.ok(response);
        }

        // Try resident login
        Resident resident = authService.authenticateResident(loginRequest.getEmail(), loginRequest.getPassword());
        if (resident != null) {
            response.put("success", true);
            response.put("user", resident);
            response.put("userType", "resident");
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid credentials");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
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

                Admin savedAdmin = authService.registerAdmin(admin);
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

                Resident savedResident = authService.registerResident(resident);
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
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
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

        // getters and setters
        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getMiddleName() { return middleName; }
        public void setMiddleName(String middleName) { this.middleName = middleName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }
}