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
}
