package com.example.springapp.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.model.LoginRequest;
import com.example.springapp.model.PasswordResetRequest;
import com.example.springapp.model.User;
import com.example.springapp.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // ==============================
    // Get All Users
    // ==============================
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get all users", description = "Retrieve a list of all users in the system")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // ==============================
    // Get Users by Role
    // ==============================
    @GetMapping(value = "/role/{role}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get users by role", description = "Retrieve users filtered by role (e.g., Employee, Admin)")
    public List<User> getUsersByRole(@Parameter(description = "User role") @PathVariable String role) {
        return service.getUsersByRole(role);
    }

    // ==============================
    // Get User by ID
    // ==============================
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    public ResponseEntity<User> getUser(@Parameter(description = "User ID") @PathVariable Long id) {
        Optional<User> user = service.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ==============================
    // Create New User
    // ==============================
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new user", description = "Create a new user in the system")
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        try {
            System.out.println("=== USER CONTROLLER DEBUG ===");
            System.out.println("Received user data: " + user);
            System.out.println("Email: " + user.getEmail());
            System.out.println("FullName: " + user.getFullName());
            System.out.println("Phone: " + user.getPhoneNumber());
            
            User createdUser = service.createUser(user);
            System.out.println("User created successfully with ID: " + createdUser.getUserId());
            return ResponseEntity.ok(createdUser);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error creating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // ==============================
    // Update User
    // ==============================
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        return ResponseEntity.ok(service.updateUser(user));
    }

    // ==============================
    // Delete User
    // ==============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            service.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==============================
    // User Login
    // ==============================
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = service.authenticateUser(
                    loginRequest.getEmail(),
                    loginRequest.getPhoneNumber(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Authentication failed: " + e.getMessage());
        }
    }

    // ==============================
    // Reset Password
    // ==============================
    @PutMapping(value = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest resetRequest) {
        try {
            User updatedUser = service.resetPassword(resetRequest.getEmail(), resetRequest.getNewPassword());
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("User not found with email: " + resetRequest.getEmail());
        }
    }

    // ==============================
    // Health Check
    // ==============================
    @GetMapping(value = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Health check", description = "Check if the service and database are working")
    public ResponseEntity<?> healthCheck() {
        try {
            long userCount = service.getAllUsers().size();
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", "Connected",
                "userCount", userCount,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "status", "DOWN",
                "database", "Disconnected",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
}