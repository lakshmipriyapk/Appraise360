package com.example.springapp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.springapp.model.EmployeeProfile;
import com.example.springapp.model.Feedback;
import com.example.springapp.model.User;
import com.example.springapp.service.EmployeeProfileService;
import com.example.springapp.service.FeedbackService;
import com.example.springapp.service.UserService;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final EmployeeProfileService employeeService;
    private final UserService userService;

    public FeedbackController(FeedbackService feedbackService,
                              EmployeeProfileService employeeService,
                              UserService userService) {
        this.feedbackService = feedbackService;
        this.employeeService = employeeService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByEmployeeId(employeeId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByReviewerId(reviewerId));
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Feedback> createFeedback(@RequestBody java.util.Map<String, Object> feedbackData) {
        try {
            System.out.println("Creating feedback with data: " + feedbackData);
            
            // Create a new Feedback object
            Feedback feedback = new Feedback();
            
            // Set basic fields
            if (feedbackData.containsKey("feedback_type")) {
                feedback.setFeedbackType((String) feedbackData.get("feedback_type"));
            } else if (feedbackData.containsKey("feedbackType")) {
                feedback.setFeedbackType((String) feedbackData.get("feedbackType"));
            } else {
                feedback.setFeedbackType("Manager Feedback"); // Default
            }
            
            if (feedbackData.containsKey("comments")) {
                feedback.setComments((String) feedbackData.get("comments"));
            }
            
            if (feedbackData.containsKey("rating")) {
                Object ratingObj = feedbackData.get("rating");
                if (ratingObj instanceof Integer) {
                    feedback.setRating((Integer) ratingObj);
                } else if (ratingObj instanceof String) {
                    try {
                        feedback.setRating(Integer.parseInt((String) ratingObj));
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid rating value: " + ratingObj);
                    }
                }
            }
            
            if (feedbackData.containsKey("achievements")) {
                feedback.setAchievements((String) feedbackData.get("achievements"));
            }
            
            if (feedbackData.containsKey("challenges")) {
                feedback.setChallenges((String) feedbackData.get("challenges"));
            }
            
            if (feedbackData.containsKey("improvements")) {
                feedback.setImprovements((String) feedbackData.get("improvements"));
            }
            
            // Handle employee relationship
            Long employeeId = null;
            if (feedbackData.containsKey("employee_id")) {
                Object employeeIdObj = feedbackData.get("employee_id");
                if (employeeIdObj instanceof Integer) {
                    employeeId = ((Integer) employeeIdObj).longValue();
                } else if (employeeIdObj instanceof String) {
                    employeeId = Long.parseLong((String) employeeIdObj);
                } else {
                    employeeId = (Long) employeeIdObj;
                }
            } else if (feedbackData.containsKey("employeeId")) {
                Object employeeIdObj = feedbackData.get("employeeId");
                if (employeeIdObj instanceof Integer) {
                    employeeId = ((Integer) employeeIdObj).longValue();
                } else if (employeeIdObj instanceof String) {
                    employeeId = Long.parseLong((String) employeeIdObj);
                } else {
                    employeeId = (Long) employeeIdObj;
                }
            }
            
            if (employeeId == null) {
            return ResponseEntity.badRequest().build();
        }

            final Long finalEmployeeId = employeeId;
            EmployeeProfile employee = employeeService.getEmployeeProfileById(finalEmployeeId)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + finalEmployeeId));
        feedback.setEmployee(employee);

            // Handle reviewer relationship
            Long reviewerId = null;
            if (feedbackData.containsKey("reviewer_id")) {
                Object reviewerIdObj = feedbackData.get("reviewer_id");
                if (reviewerIdObj instanceof Integer) {
                    reviewerId = ((Integer) reviewerIdObj).longValue();
                } else if (reviewerIdObj instanceof String) {
                    reviewerId = Long.parseLong((String) reviewerIdObj);
                } else {
                    reviewerId = (Long) reviewerIdObj;
                }
            } else if (feedbackData.containsKey("reviewerId")) {
                Object reviewerIdObj = feedbackData.get("reviewerId");
                if (reviewerIdObj instanceof Integer) {
                    reviewerId = ((Integer) reviewerIdObj).longValue();
                } else if (reviewerIdObj instanceof String) {
                    reviewerId = Long.parseLong((String) reviewerIdObj);
                } else {
                    reviewerId = (Long) reviewerIdObj;
                }
            }
            
            if (reviewerId != null) {
                final Long finalReviewerId = reviewerId;
                User reviewer = userService.getUserById(finalReviewerId)
                        .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Reviewer not found with ID " + finalReviewerId));
            feedback.setReviewer(reviewer);
            } else {
                // Default reviewer if not provided
                User defaultReviewer = userService.getUserById(1L)
                        .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Default reviewer not found"));
                feedback.setReviewer(defaultReviewer);
            }
            
            Feedback createdFeedback = feedbackService.createFeedback(feedback);
            System.out.println("Feedback created successfully: " + createdFeedback.getFeedbackId());
            return ResponseEntity.ok(createdFeedback);
            
        } catch (Exception e) {
            System.err.println("Error creating feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping(value = "/employee/{employeeId}/reviewer/{reviewerId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Feedback> createFeedbackWithIds(@PathVariable Long employeeId,
                                                          @PathVariable Long reviewerId,
                                                          @RequestBody Feedback feedback) {
        EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + employeeId));
        User reviewer = userService.getUserById(reviewerId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Reviewer not found with ID " + reviewerId));

        feedback.setEmployee(employee);
        feedback.setReviewer(reviewer);

        return ResponseEntity.ok(feedbackService.createFeedback(feedback));
    }

    @PutMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateFeedback(@PathVariable Long id, @RequestBody Map<String, Object> feedbackData) {
        try {
            System.out.println("Updating feedback with ID: " + id);
            System.out.println("Received feedback data: " + feedbackData);
            
            // Get existing feedback
            Feedback existingFeedback = feedbackService.getFeedbackById(id)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Feedback not found with ID " + id));
            
            System.out.println("Found existing feedback: " + existingFeedback.getFeedbackId());
            System.out.println("Original employee: " + existingFeedback.getEmployee().getUser().getFullName() + " (ID: " + existingFeedback.getEmployee().getEmployeeProfileId() + ")");
            System.out.println("Original reviewer: " + existingFeedback.getReviewer().getFullName() + " (ID: " + existingFeedback.getReviewer().getUserId() + ")");
            
            // Update only the fields that should be updated
            if (feedbackData.containsKey("feedbackType") && feedbackData.get("feedbackType") != null) {
                existingFeedback.setFeedbackType((String) feedbackData.get("feedbackType"));
            }
            if (feedbackData.containsKey("comments") && feedbackData.get("comments") != null) {
                existingFeedback.setComments((String) feedbackData.get("comments"));
            }
            if (feedbackData.containsKey("rating") && feedbackData.get("rating") != null) {
                Object ratingObj = feedbackData.get("rating");
                if (ratingObj instanceof Integer) {
                    existingFeedback.setRating((Integer) ratingObj);
                } else if (ratingObj instanceof String) {
                    try {
                        existingFeedback.setRating(Integer.parseInt((String) ratingObj));
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid rating format: " + ratingObj);
                    }
                }
            }
            if (feedbackData.containsKey("achievements") && feedbackData.get("achievements") != null) {
                existingFeedback.setAchievements((String) feedbackData.get("achievements"));
            }
            if (feedbackData.containsKey("challenges") && feedbackData.get("challenges") != null) {
                existingFeedback.setChallenges((String) feedbackData.get("challenges"));
            }
            if (feedbackData.containsKey("improvements") && feedbackData.get("improvements") != null) {
                existingFeedback.setImprovements((String) feedbackData.get("improvements"));
            }
            
            // Keep original employee and reviewer - don't change them
            // This prevents issues with circular references and missing data
            
            System.out.println("Saving updated feedback...");
            System.out.println("Before save - Employee: " + existingFeedback.getEmployee().getUser().getFullName() + " (ID: " + existingFeedback.getEmployee().getEmployeeProfileId() + ")");
            System.out.println("Before save - Reviewer: " + existingFeedback.getReviewer().getFullName() + " (ID: " + existingFeedback.getReviewer().getUserId() + ")");
            Feedback updatedFeedback = feedbackService.updateFeedback(existingFeedback);
            System.out.println("After save - Employee: " + updatedFeedback.getEmployee().getUser().getFullName() + " (ID: " + updatedFeedback.getEmployee().getEmployeeProfileId() + ")");
            System.out.println("After save - Reviewer: " + updatedFeedback.getReviewer().getFullName() + " (ID: " + updatedFeedback.getReviewer().getUserId() + ")");
            System.out.println("Successfully updated feedback: " + updatedFeedback.getFeedbackId());
            
            return ResponseEntity.ok(updatedFeedback);
            
        } catch (jakarta.persistence.EntityNotFoundException e) {
            System.err.println("Feedback not found: " + e.getMessage());
            return ResponseEntity.status(404).body("{\"error\": \"Feedback not found with ID " + id + "\"}");
        } catch (Exception e) {
            System.err.println("Error updating feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Failed to update feedback: " + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
