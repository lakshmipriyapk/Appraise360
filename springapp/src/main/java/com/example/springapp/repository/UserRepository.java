package com.example.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    // Find user by username
    Optional<User> findByUsername(String username);
    
    // Find users by role
    List<User> findByRole(String role);
    
        // Find users by full name
        List<User> findByFullName(String fullName);

        // Find users by first name
        List<User> findByFirstName(String firstName);

        // Find users by last name
        List<User> findByLastName(String lastName);

        // Find users by phone number
        Optional<User> findByPhoneNumber(String phoneNumber);
}
