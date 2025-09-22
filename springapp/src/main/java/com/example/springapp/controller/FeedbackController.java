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
import com.example.springapp.model.Feedback;
import com.example.springapp.model.User;
import com.example.springapp.service.EmployeeProfileService;
import com.example.springapp.service.FeedbackService;
import com.example.springapp.service.UserService;

@RestController
@RequestMapping("/api/feedbacks")
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

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByManagerId(managerId));
    }

    @PostMapping("/employee/{employeeId}/manager/{managerId}")
    public ResponseEntity<Feedback> createFeedback(@PathVariable Long employeeId,
                                                   @PathVariable Long managerId,
                                                   @RequestBody Feedback feedback) {
        EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID " + employeeId));
        User manager = userService.getUserById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found with ID " + managerId));

        feedback.setEmployee(employee);
        feedback.setManager(manager);

        return ResponseEntity.ok(feedbackService.createFeedback(feedback));
    }

    @PutMapping("/{id}")
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
