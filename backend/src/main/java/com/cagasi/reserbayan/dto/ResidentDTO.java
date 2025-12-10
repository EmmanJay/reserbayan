package com.cagasi.reserbayan.dto;

import java.time.LocalDate;

public class ResidentDTO {
    private Long residentId;
    private String firstName;
    private String lastName;
    private String middleName;
    private String residentEmail;
    private String phoneNumber;
    private String address;
    private LocalDate birthdate;

    // Constructors
    public ResidentDTO() {}

    public ResidentDTO(Long residentId, String firstName, String lastName, String middleName,
                      String residentEmail, String phoneNumber, String address, LocalDate birthdate) {
        this.residentId = residentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.residentEmail = residentEmail;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.birthdate = birthdate;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(LocalDate birthdate) {
        this.birthdate = birthdate;
    }
}