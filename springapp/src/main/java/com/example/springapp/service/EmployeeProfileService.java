package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.EmployeeProfile;
import com.example.springapp.repository.EmployeeProfileRepository;

@Service
public class EmployeeProfileService {

    private final EmployeeProfileRepository repo;

    public EmployeeProfileService(EmployeeProfileRepository repo) {
        this.repo = repo;
    }

    public List<EmployeeProfile> getAllEmployeeProfiles() {
        return repo.findAll();
    }

    public Optional<EmployeeProfile> getEmployeeProfileById(Long id) {
        return repo.findById(id);
    }

    public List<EmployeeProfile> getEmployeeProfilesByUserId(Long userId) {
        return repo.findByUserUserId(userId);
    }

    public EmployeeProfile createEmployeeProfile(EmployeeProfile profile) {
        if (profile.getUser() == null) {
            throw new IllegalArgumentException("User must be linked to EmployeeProfile");
        }
        return repo.save(profile);
    }

    public EmployeeProfile updateEmployeeProfile(EmployeeProfile profile) {
        return repo.save(profile);
    }

    public void deleteEmployeeProfile(Long id) {
        repo.deleteById(id);
    }
}
