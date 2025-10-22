package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // ✅ Get all users
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ✅ Get users by role (e.g., only employees)
    public List<User> getUsersByRole(String role) {
        return repo.findByRole(role);
    }

    // ✅ Get user by ID
    public Optional<User> getUserById(Long id) {
        return repo.findById(id);
    }

    // ✅ Create new user
    public User createUser(User user) {
        System.out.println("=== CREATE USER DEBUG ===");
        System.out.println("Email: " + user.getEmail());
        System.out.println("FullName: " + user.getFullName());
        System.out.println("Phone: " + user.getPhoneNumber());
        System.out.println("Role: " + user.getRole());

        // Validate required fields
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required!");
        }
        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required!");
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required!");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required!");
        }

        // Set default role if missing
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("Employee");
        }

        // Initialize empty list to prevent JPA cascade issues
        if (user.getEmployeeProfiles() == null) {
            user.setEmployeeProfiles(new java.util.ArrayList<>());
        }

        try {
            // Check for duplicate email / username / phone
            if (repo.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("Email already registered!");
            }
            if (user.getUsername() != null && !user.getUsername().trim().isEmpty() && repo.existsByUsername(user.getUsername())) {
                throw new IllegalArgumentException("Username already exists!");
            }
            if (repo.existsByPhoneNumber(user.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already registered!");
            }

            User saved = repo.save(user);
            System.out.println("User created successfully with ID: " + saved.getUserId());
            return saved;
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors
            throw e;
        } catch (Exception e) {
            System.err.println("Error saving user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    // ✅ Update existing user
    public User updateUser(User user) {
        if (user.getEmployeeProfiles() != null) {
            user.getEmployeeProfiles().forEach(profile -> profile.setUser(user));
        }
        return repo.save(user);
    }

    // ✅ Delete user by ID
    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        repo.deleteById(id);
    }

    // ✅ Authenticate user (email or phone + password)
    public User authenticateUser(String email, String phoneNumber, String password) {
        System.out.println("=== AUTHENTICATION DEBUG ===");
        System.out.println("Email: " + email + " | Phone: " + phoneNumber);

        Optional<User> userOpt = Optional.empty();

        if (email != null && !email.isBlank()) {
            userOpt = repo.findByEmail(email.trim());
        } else if (phoneNumber != null && !phoneNumber.isBlank()) {
            userOpt = repo.findByPhoneNumber(phoneNumber.trim());
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (password != null && password.equals(user.getPassword())) {
            System.out.println("Authentication successful for: " + user.getEmail());
            return user;
        }

        throw new RuntimeException("Invalid credentials");
    }

    // ✅ Reset user password
    public User resetPassword(String email, String newPassword) {
        System.out.println("=== PASSWORD RESET DEBUG ===");
        System.out.println("Email: " + email);

        Optional<User> userOpt = repo.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOpt.get();
        user.setPassword(newPassword);
        User updated = repo.save(user);
        System.out.println("Password reset successfully for: " + updated.getEmail());
        return updated;
    }
}
