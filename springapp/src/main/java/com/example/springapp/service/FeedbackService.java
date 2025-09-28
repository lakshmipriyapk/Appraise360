package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.Feedback;
import com.example.springapp.repository.FeedbackRepository;

@Service
public class FeedbackService {

    private final FeedbackRepository repo;

    public FeedbackService(FeedbackRepository repo) {
        this.repo = repo;
    }

    public List<Feedback> getAllFeedbacks() {
        return repo.findAll();
    }

    public Optional<Feedback> getFeedbackById(Long id) {
        return repo.findById(id);
    }

    public List<Feedback> getFeedbacksByEmployeeId(Long employeeProfileId) {
        return repo.findByEmployee_EmployeeProfileId(employeeProfileId);
    }

    public List<Feedback> getFeedbacksByReviewerId(Long reviewerId) {
        return repo.findByReviewer_UserId(reviewerId);
    }

    public Feedback createFeedback(Feedback feedback) {
        if (feedback.getEmployee() == null) {
            throw new IllegalArgumentException("Employee must be set for Feedback");
        }
        
        // Set default values for new fields if not provided
        if (feedback.getFeedbackType() == null || feedback.getFeedbackType().isEmpty()) {
            feedback.setFeedbackType("Self-Feedback");
        }
        if (feedback.getRating() == null) {
            feedback.setRating(0);
        }
        
        return repo.save(feedback);
    }

    public Feedback updateFeedback(Feedback feedback) {
        return repo.save(feedback);
    }

    public void deleteFeedback(Long id) {
        repo.deleteById(id);
    }
}
