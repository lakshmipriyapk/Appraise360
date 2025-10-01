package com.example.springapp.controller;

import java.util.List;

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
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        // Validate required fields
        if (feedback.getEmployee() == null || feedback.getEmployee().getEmployeeProfileId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Get employee
        EmployeeProfile employee = employeeService.getEmployeeProfileById(feedback.getEmployee().getEmployeeProfileId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + feedback.getEmployee().getEmployeeProfileId()));
        feedback.setEmployee(employee);

        // Handle reviewer if provided
        if (feedback.getReviewer() != null && feedback.getReviewer().getUserId() != null) {
            User reviewer = userService.getUserById(feedback.getReviewer().getUserId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Reviewer not found with ID " + feedback.getReviewer().getUserId()));
            feedback.setReviewer(reviewer);
        }

        return ResponseEntity.ok(feedbackService.createFeedback(feedback));
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
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedback) {
        feedback.setFeedbackId(id);
        return ResponseEntity.ok(feedbackService.updateFeedback(feedback));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
