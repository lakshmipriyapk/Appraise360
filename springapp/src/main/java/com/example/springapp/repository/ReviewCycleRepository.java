package com.example.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.ReviewCycle;

@Repository
public interface ReviewCycleRepository extends JpaRepository<ReviewCycle, Long> {

    // Find review cycles by status
    List<ReviewCycle> findByStatus(String status);

    // Find review cycles by cycle name
    List<ReviewCycle> findByCycleNameContainingIgnoreCase(String cycleName);
}
