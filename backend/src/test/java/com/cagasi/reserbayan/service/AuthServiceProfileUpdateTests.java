package com.cagasi.reserbayan.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cagasi.reserbayan.config.JwtUtil;
import com.cagasi.reserbayan.dto.ProfileUpdateDTO;
import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.Role;
import com.cagasi.reserbayan.entity.Status;
import com.cagasi.reserbayan.repository.AdminRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceProfileUpdateTests {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private ResidentRepository residentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void updatesAuthenticatedResidentProfileAndReturnsFreshToken() {
        Resident resident = new Resident();
        resident.setResidentId(12L);
        resident.setResidentEmail("old@example.com");

        ProfileUpdateDTO profile = new ProfileUpdateDTO();
        profile.setFirstName("Ana");
        profile.setMiddleName("M");
        profile.setLastName("Santos");
        profile.setResidentEmail("new@example.com");
        profile.setPhoneNumber("09170000000");
        profile.setBirthdate(LocalDate.of(1998, 5, 9));
        profile.setGender("Female");
        profile.setAddressLine1("12 Main");
        profile.setSitio("Sitio A");
        profile.setBarangay("Barangay 1");
        profile.setCity("Cagayan de Oro");
        profile.setProvince("Misamis Oriental");
        profile.setRegion("Region X");

        when(residentRepository.findByResidentEmail("old@example.com")).thenReturn(Optional.of(resident));
        when(adminRepository.findByResidentEmail("new@example.com")).thenReturn(Optional.empty());
        when(residentRepository.findByResidentEmail("new@example.com")).thenReturn(Optional.empty());
        when(residentRepository.save(any(Resident.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken("new@example.com", "RESIDENT")).thenReturn("next-token");

        Map<String, Object> result = authService.updateAuthenticatedProfile("old@example.com", "ROLE_RESIDENT", profile);

        ArgumentCaptor<Resident> captor = ArgumentCaptor.forClass(Resident.class);
        verify(residentRepository).save(captor.capture());
        Resident saved = captor.getValue();
        assertThat(saved.getResidentId()).isEqualTo(12L);
        assertThat(saved.getResidentEmail()).isEqualTo("new@example.com");
        assertThat(saved.getAddressLine1()).isEqualTo("12 Main");
        assertThat(result.get("token")).isEqualTo("next-token");
        assertThat(result.get("role")).isEqualTo("RESIDENT");
    }

    @Test
    void rejectsResidentDuplicateEmail() {
        Resident current = new Resident();
        current.setResidentId(12L);
        current.setResidentEmail("current@example.com");

        Resident duplicate = new Resident();
        duplicate.setResidentId(22L);
        duplicate.setResidentEmail("taken@example.com");

        ProfileUpdateDTO profile = new ProfileUpdateDTO();
        profile.setResidentEmail("taken@example.com");

        when(residentRepository.findByResidentEmail("current@example.com")).thenReturn(Optional.of(current));
        when(adminRepository.findByResidentEmail("taken@example.com")).thenReturn(Optional.empty());
        when(residentRepository.findByResidentEmail("taken@example.com")).thenReturn(Optional.of(duplicate));

        assertThatThrownBy(() -> authService.updateAuthenticatedProfile("current@example.com", "ROLE_RESIDENT", profile))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already registered as resident");
    }

    @Test
    void updatesAdminSafeFieldsOnly() {
        Admin admin = new Admin();
        admin.setResidentId(7L);
        admin.setFirstName("Old");
        admin.setResidentEmail("admin@example.com");
        admin.setUsername("oldadmin");
        admin.setPassword("encoded-password");
        admin.setPlainPassword("plain-password");
        admin.setRole(Role.ADMIN);
        admin.setStatus(Status.ACTIVE);
        admin.setProofOfEmploymentPath("uploads/admin/proof.png");

        ProfileUpdateDTO profile = new ProfileUpdateDTO();
        profile.setFirstName("Updated");
        profile.setMiddleName("A");
        profile.setLastName("Admin");
        profile.setResidentEmail("newadmin@example.com");
        profile.setUsername("newadmin");
        profile.setPhoneNumber("09990000000");
        profile.setAddress("Barangay Hall");
        profile.setPosition("Clerk");

        when(adminRepository.findByUsername("oldadmin")).thenReturn(Optional.of(admin));
        when(residentRepository.findByResidentEmail("newadmin@example.com")).thenReturn(Optional.empty());
        when(adminRepository.findByResidentEmail("newadmin@example.com")).thenReturn(Optional.empty());
        when(adminRepository.findByUsername("newadmin")).thenReturn(Optional.empty());
        when(adminRepository.save(any(Admin.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken("newadmin", "ADMIN")).thenReturn("admin-token");

        Map<String, Object> result = authService.updateAuthenticatedProfile("oldadmin", "ROLE_ADMIN", profile);

        ArgumentCaptor<Admin> captor = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(captor.capture());
        Admin saved = captor.getValue();
        assertThat(saved.getFirstName()).isEqualTo("Updated");
        assertThat(saved.getResidentEmail()).isEqualTo("newadmin@example.com");
        assertThat(saved.getUsername()).isEqualTo("newadmin");
        assertThat(saved.getPosition()).isEqualTo("Clerk");
        assertThat(saved.getPassword()).isEqualTo("encoded-password");
        assertThat(saved.getPlainPassword()).isEqualTo("plain-password");
        assertThat(saved.getRole()).isEqualTo(Role.ADMIN);
        assertThat(saved.getStatus()).isEqualTo(Status.ACTIVE);
        assertThat(saved.getProofOfEmploymentPath()).isEqualTo("uploads/admin/proof.png");
        assertThat(result.get("token")).isEqualTo("admin-token");
    }

    @Test
    void rejectsAdminDuplicateUsername() {
        Admin current = new Admin();
        current.setResidentId(7L);
        current.setResidentEmail("admin@example.com");
        current.setUsername("admin");
        current.setRole(Role.ADMIN);

        Admin duplicate = new Admin();
        duplicate.setResidentId(8L);
        duplicate.setUsername("taken");

        ProfileUpdateDTO profile = new ProfileUpdateDTO();
        profile.setResidentEmail("admin@example.com");
        profile.setUsername("taken");

        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(current));
        when(adminRepository.findByUsername("taken")).thenReturn(Optional.of(duplicate));

        assertThatThrownBy(() -> authService.updateAuthenticatedProfile("admin", "ROLE_ADMIN", profile))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username already registered");
    }
}
