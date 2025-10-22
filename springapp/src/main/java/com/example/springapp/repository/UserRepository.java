package com.example.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by unique fields
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByPhoneNumber(String phoneNumber);

    // Existence checks for validation
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhoneNumber(String phoneNumber);

    // Find users by role
    List<User> findByRole(String role);
}
