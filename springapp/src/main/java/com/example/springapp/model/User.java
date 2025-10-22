package com.example.springapp.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
@Schema(description = "User entity representing a system user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier for the user")
    private Long userId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    @Schema(description = "User's email address")
    private String email;

    @Schema(description = "User's first name")
    private String firstName;

    @NotBlank(message = "Full name is required")
    @Schema(description = "User's full name")
    private String fullName;

    @Schema(description = "User's last name")
    private String lastName;

    @NotBlank(message = "Password is required")
    @Schema(description = "User's password", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;

    @NotBlank(message = "Phone number is required")
    @Schema(description = "User's phone number")
    private String phoneNumber;

    @Schema(description = "User's role in the system")
    private String role;

    @Schema(description = "User's username")
    private String username;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"user", "goals", "appraisals", "feedbacks", "hibernateLazyInitializer", "handler"})
    @Schema(description = "List of employee profiles associated with this user", accessMode = Schema.AccessMode.READ_ONLY)
    private List<EmployeeProfile> employeeProfiles;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
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
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public List<EmployeeProfile> getEmployeeProfiles() {
        return employeeProfiles;
    }
    public void setEmployeeProfiles(List<EmployeeProfile> employeeProfiles) {
        this.employeeProfiles = employeeProfiles;
    }
}
