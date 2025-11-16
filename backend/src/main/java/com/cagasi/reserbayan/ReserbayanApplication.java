package com.cagasi.reserbayan;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.cagasi.reserbayan.entity.Admin;
import com.cagasi.reserbayan.service.AuthService;

@SpringBootApplication
public class ReserbayanApplication implements CommandLineRunner {

	@Autowired
	private AuthService authService;

	public static void main(String[] args) {
		SpringApplication.run(ReserbayanApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Create default admin if not exists
		try {
			Admin defaultAdmin = new Admin();
			defaultAdmin.setFirstName("Default");
			defaultAdmin.setLastName("Admin");
			defaultAdmin.setMiddleName("");
			defaultAdmin.setResidentEmail("admin@reserbayan.com");
			defaultAdmin.setPassword("Admin123!");
			defaultAdmin.setPhoneNumber("1234567890");
			defaultAdmin.setAddress("Default Address");

			authService.registerAdmin(defaultAdmin);
			System.out.println("Default admin created: admin@reserbayan.com / Admin123!");
		} catch (Exception e) {
			System.out.println("Default admin already exists or error: " + e.getMessage());
		}
	}

}
