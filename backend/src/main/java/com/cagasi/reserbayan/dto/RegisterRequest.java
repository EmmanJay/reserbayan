package com.cagasi.reserbayan.dto;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

public class RegisterRequest {

    // Discriminator to check if "admin" or "resident"
    private String userType;

    private Long residentId; // For resubmission updates
    private String firstName;
    private String lastName;
    private String middleName;
    private String email;
    private String password;
    private String phoneNumber;
    private LocalDate birthDate; // Spring automatically parses 'YYYY-MM-DD'

    // Address Fields
    private String gender;
    private String region;
    private String province;
    private String city;
    private String barangay;
    private String sitio;
    private String addressLine1;

    // File handling
    private MultipartFile validId; // For Residents
    private MultipartFile proofOfEmployment; // For Admins

    // --- GETTERS AND SETTERS ---

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Long getResidentId() {
        return residentId;
    }

    public void setResidentId(Long residentId) {
        this.residentId = residentId;
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

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getBarangay() {
        return barangay;
    }

    public void setBarangay(String barangay) {
        this.barangay = barangay;
    }

    public String getSitio() {
        return sitio;
    }

    public void setSitio(String sitio) {
        this.sitio = sitio;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
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