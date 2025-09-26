package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.ReviewCycle;
import com.example.springapp.repository.ReviewCycleRepository;

@Service
public class ReviewCycleService {

    private final ReviewCycleRepository repo;

    public ReviewCycleService(ReviewCycleRepository repo) {
        this.repo = repo;
    }

    public List<ReviewCycle> getAllReviewCycles() {
        return repo.findAll();
    }

    public Optional<ReviewCycle> getReviewCycleById(Long id) {
        return repo.findById(id);
    }

    public ReviewCycle createReviewCycle(ReviewCycle cycle) {
        // Set default values for new fields if not provided
        if (cycle.getStatus() == null || cycle.getStatus().isEmpty()) {
            cycle.setStatus("Scheduled");
        }
        if (cycle.getDeadline() == null) {
            throw new IllegalArgumentException("Deadline is required for ReviewCycle");
        }
        
        return repo.save(cycle);
    }

    public ReviewCycle updateReviewCycle(ReviewCycle cycle) {
        return repo.save(cycle);
    }

    public void deleteReviewCycle(Long id) {
        repo.deleteById(id);
    }
}
