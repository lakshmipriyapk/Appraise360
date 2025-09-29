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
        // Validate uniqueness to avoid DB constraint violations
        if (user.getEmail() != null && repo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (user.getUsername() != null && repo.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (user.getPhoneNumber() != null && repo.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        // Set default values for new fields if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("Employee");
        }

        // ensure bidirectional link
        if (user.getEmployeeProfiles() != null) {
            user.getEmployeeProfiles().forEach(profile -> profile.setUser(user));
        }
        return repo.save(user);
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
        Optional<User> userOpt = null;
        
        // Try to find user by email first, then by phone number
        if (email != null && !email.isEmpty()) {
            userOpt = repo.findByEmail(email);
        } else if (phoneNumber != null && !phoneNumber.isEmpty()) {
            userOpt = repo.findByPhoneNumber(phoneNumber);
        }
        
        if (userOpt != null && userOpt.isPresent()) {
            User user = userOpt.get();
            // For now, we're doing plain text comparison
            // In production, you should use BCrypt or similar
            if (password.equals(user.getPassword())) {
                return user;
            }
        }
        return null;
    }
}
