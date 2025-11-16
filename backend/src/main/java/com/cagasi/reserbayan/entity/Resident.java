package com.cagasi.reserbayan.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "residents")
public class Resident {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long residentId;
   private String firstName;
   private String lastName;
   private String middleName;
   private String residentEmail;
   private String password;
   private String phoneNumber;
   private String address;
   private LocalDate birthdate;
   @Column(nullable = false, updatable = false)
   private LocalDateTime createdAt = LocalDateTime.now();
   // Relationships
   @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<DocumentRequest> documentRequests;
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
   public LocalDate getBirthdate() {
       return birthdate;
   }
   public void setBirthdate(LocalDate birthdate) {
       this.birthdate = birthdate;
   }
   public LocalDateTime getCreatedAt() {
       return createdAt;
   }
   public List<DocumentRequest> getDocumentRequests() {
       return documentRequests;
   }
   public void setDocumentRequests(List<DocumentRequest> documentRequests) {
       this.documentRequests = documentRequests;
   }
}