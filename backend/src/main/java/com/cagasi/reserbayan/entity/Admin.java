package com.cagasi.reserbayan.entity;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
@Entity
@Table(name = "admin")
public class Admin {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long residentId;
   private String firstName;
   private String lastName;
   private String middleName;
   @Column(unique = true)
   private String residentEmail;
   private String password;
   private String phoneNumber;
   private String address;
   private String position;
   @Column(nullable = false, updatable = false)
   private LocalDateTime createdAt = LocalDateTime.now();
   // Relationships
   @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL)
   private List<StatusLog> statusLogs;
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
   public String getPosition() {
       return position;
   }
   public void setPosition(String position) {
       this.position = position;
   }
   public LocalDateTime getCreatedAt() {
       return createdAt;
   }
   public List<StatusLog> getStatusLogs() {
       return statusLogs;
   }
   public void setStatusLogs(List<StatusLog> statusLogs) {
       this.statusLogs = statusLogs;
   }
   
}