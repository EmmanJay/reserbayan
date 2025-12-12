package com.cagasi.reserbayan.dto;

import java.time.LocalDate;

public class ResidentDTO {
    private Long residentId;
    private String firstName;
    private String lastName;
    private String middleName;
    private String residentEmail;
    private String phoneNumber;
    private LocalDate birthdate;
    private String validIdPath;

    // --- NEW FIELDS START ---
    private String gender;
    private String region;
    private String province;
    private String city;
    private String barangay;
    private String sitio;
    private String addressLine1; // Replaces the old 'address' field
    // --- NEW FIELDS END ---

    // Constructors
    public ResidentDTO() {
    }

    public ResidentDTO(Long residentId, String firstName, String lastName, String middleName,
            String residentEmail, String phoneNumber, LocalDate birthdate,
            String gender, String region, String province, String city,
            String barangay, String sitio, String addressLine1) {
        this.residentId = residentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.residentEmail = residentEmail;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;

        // New fields
        this.gender = gender;
        this.region = region;
        this.province = province;
        this.city = city;
        this.barangay = barangay;
        this.sitio = sitio;
        this.addressLine1 = addressLine1;
    }

    // Getters and Setters

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

    public String getResidentEmail() {
        return residentEmail;
    }

    public void setResidentEmail(String residentEmail) {
        this.residentEmail = residentEmail;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(LocalDate birthdate) {
        this.birthdate = birthdate;
    }

    public String getValidIdPath() {
        return validIdPath;
    }

    public void setValidIdPath(String validIdPath) {
        this.validIdPath = validIdPath;
    }

    // --- NEW GETTERS AND SETTERS ---

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
}