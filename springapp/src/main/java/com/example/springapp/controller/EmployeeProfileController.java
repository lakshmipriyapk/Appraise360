package com.example.springapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.model.EmployeeProfile;
import com.example.springapp.model.User;
import com.example.springapp.service.EmployeeProfileService;
import com.example.springapp.service.UserService;

@RestController
@RequestMapping("/api/employeeProfiles")
public class EmployeeProfileController {

    private final EmployeeProfileService profileService;
    private final UserService userService;

    public EmployeeProfileController(EmployeeProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeProfile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllEmployeeProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeProfile> getProfileById(@PathVariable Long id) {
        return profileService.getEmployeeProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EmployeeProfile>> getProfilesByUserId(@PathVariable Long userId) {
        List<EmployeeProfile> profiles = profileService.getEmployeeProfilesByUserId(userId);
        return profiles.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(profiles);
    }

    // 🔗 Create profile linked with an existing User
    @PostMapping("/user/{userId}")
    public ResponseEntity<EmployeeProfile> createProfileForUser(@PathVariable Long userId,
                                                                @RequestBody EmployeeProfile profile) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID " + userId));

        profile.setUser(user);
        EmployeeProfile created = profileService.createEmployeeProfile(profile);

        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeProfile> updateProfile(@PathVariable Long id,
                                                         @RequestBody EmployeeProfile profile) {
        profile.setEmployeeProfileId(id);
        return ResponseEntity.ok(profileService.updateEmployeeProfile(profile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        profileService.deleteEmployeeProfile(id);
        return ResponseEntity.noContent().build();
    }
}
