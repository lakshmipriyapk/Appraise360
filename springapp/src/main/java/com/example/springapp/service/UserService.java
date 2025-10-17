package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return repo.findById(id);
    }

    public User createUser(User user) {
        System.out.println("=== CREATE USER DEBUG ===");
        System.out.println("User data received: " + user);
        System.out.println("Email: " + user.getEmail());
        System.out.println("FullName: " + user.getFullName());
        System.out.println("PhoneNumber: " + user.getPhoneNumber());
        System.out.println("Role: " + user.getRole());
        System.out.println("Username: " + user.getUsername());
        
        // Set default values for new fields if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("Employee");
        }

        // Clear employee profiles to avoid cascade issues during user creation
        user.setEmployeeProfiles(null);
        
        try {
            User savedUser = repo.save(user);
            System.out.println("User saved successfully with ID: " + savedUser.getUserId());
            return savedUser;
        } catch (Exception e) {
            System.err.println("Error saving user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public User updateUser(User user) {
        // ensure bidirectional link
        if (user.getEmployeeProfiles() != null) {
            user.getEmployeeProfiles().forEach(profile -> profile.setUser(user));
        }
        return repo.save(user);
    }

    public void deleteUser(Long id) {
        repo.deleteById(id);
    }

    public User authenticateUser(String email, String phoneNumber, String password) {
        System.out.println("=== AUTHENTICATION DEBUG ===");
        System.out.println("Email: " + email);
        System.out.println("Phone: " + phoneNumber);
        System.out.println("Password: " + password);
        
        Optional<User> userOpt = Optional.empty();
        
        // Try to find user by email first, then by phone number
        if (email != null && !email.trim().isEmpty()) {
            System.out.println("Searching by email: " + email);
            userOpt = repo.findByEmail(email.trim());
        } else if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            System.out.println("Searching by phone: " + phoneNumber);
            userOpt = repo.findByPhoneNumber(phoneNumber.trim());
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found: " + user.getEmail() + ", Role: " + user.getRole());
            System.out.println("Stored password: '" + user.getPassword() + "'");
            System.out.println("Provided password: '" + password + "'");
            System.out.println("Password length stored: " + (user.getPassword() != null ? user.getPassword().length() : "null"));
            System.out.println("Password length provided: " + (password != null ? password.length() : "null"));
            
            // For now, we're doing plain text comparison
            // In production, you should use BCrypt or similar
            if (password != null && password.equals(user.getPassword())) {
                System.out.println("Password match! Authentication successful.");
                return user;
            } else {
                System.out.println("Password mismatch!");
                System.out.println("Stored: '" + user.getPassword() + "'");
                System.out.println("Provided: '" + password + "'");
            }
        } else {
            System.out.println("No user found with provided credentials.");
        }
        
        // If no user found or password doesn't match, throw exception
        throw new RuntimeException("Invalid credentials");
    }

    public User resetPassword(String email, String newPassword) {
        System.out.println("=== PASSWORD RESET DEBUG ===");
        System.out.println("Email: " + email);
        System.out.println("New Password: " + newPassword);
        
        // Find user by email
        Optional<User> userOpt = repo.findByEmail(email.trim());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found: " + user.getEmail());
            
            // Update password
            user.setPassword(newPassword);
            User updatedUser = repo.save(user);
            
            System.out.println("Password updated successfully for user: " + updatedUser.getEmail());
            return updatedUser;
        } else {
            System.out.println("No user found with email: " + email);
            throw new RuntimeException("User not found with email: " + email);
        }
    }
}
