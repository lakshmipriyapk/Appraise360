package com.example.springapp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;

import com.example.springapp.model.User;
import com.example.springapp.model.LoginRequest;
import com.example.springapp.model.PasswordResetRequest;
import com.example.springapp.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a list of all users in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved list of users")
    })
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public Optional<User> getUser(@Parameter(description = "User ID") @PathVariable Long id) {
        return service.getUserById(id);
    }

    @PostMapping
    @Operation(summary = "Create a new user", description = "Create a new user in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data")
    })
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        try {
            User createdUser = service.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/test-user")
    public User createTestUser() {
        User testUser = new User();
        testUser.setEmail("admin@company.com");
        testUser.setPassword("password123");
        testUser.setFullName("Admin User");
        testUser.setRole("Admin");
        testUser.setUsername("admin");
        return service.createUser(testUser);
    }

    @GetMapping("/debug")
    public String debugUsers() {
        List<User> users = service.getAllUsers();
        StringBuilder debug = new StringBuilder("=== DATABASE USERS ===\n");
        for (User user : users) {
            debug.append("ID: ").append(user.getUserId())
                 .append(", Email: ").append(user.getEmail())
                 .append(", Phone: ").append(user.getPhoneNumber())
                 .append(", Role: ").append(user.getRole())
                 .append(", Password: ").append(user.getPassword())
                 .append("\n");
        }
        return debug.toString();
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        return service.updateUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with email/phone and password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Authentication failed")
    })
    public User login(@RequestBody LoginRequest loginRequest) {
        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("Phone: " + loginRequest.getPhoneNumber());
        System.out.println("Password: " + loginRequest.getPassword());
        
        try {
            User user = service.authenticateUser(
                    loginRequest.getEmail(),
                    loginRequest.getPhoneNumber(),
                    loginRequest.getPassword()
            );
            System.out.println("Login successful for user: " + user.getEmail());
            return user;
        } catch (RuntimeException e) {
            System.out.println("Login failed: " + e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    @PutMapping("/reset-password")
    @Operation(summary = "Reset user password", description = "Reset password for a user by email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "400", description = "Invalid data")
    })
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest resetRequest) {
        System.out.println("=== PASSWORD RESET REQUEST RECEIVED ===");
        System.out.println("Email: " + resetRequest.getEmail());
        System.out.println("New Password: " + resetRequest.getNewPassword());
        
        try {
            User updatedUser = service.resetPassword(resetRequest.getEmail(), resetRequest.getNewPassword());
            System.out.println("Password reset successful for user: " + updatedUser.getEmail());
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            System.out.println("Password reset failed: " + e.getMessage());
            return ResponseEntity.status(404).body("User not found with email: " + resetRequest.getEmail());
        } catch (Exception e) {
            System.out.println("Password reset error: " + e.getMessage());
            return ResponseEntity.status(400).body("Error resetting password: " + e.getMessage());
        }
    }
}
