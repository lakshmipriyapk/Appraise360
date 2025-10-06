package com.example.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/fix-feedback-mappings")
    public ResponseEntity<String> fixFeedbackMappings() {
        try {
            System.out.println("Fixing feedback employee mappings...");
            
            // Fix the mappings - map each feedback to the correct employee
            String[] updates = {
                "UPDATE feedbacks SET employee_id = 1 WHERE feedback_id = 12", // Nandhini S Y
                "UPDATE feedbacks SET employee_id = 3 WHERE feedback_id = 13", // Lakshmipriya P K
                "UPDATE feedbacks SET employee_id = 3 WHERE feedback_id = 14", // Priya
                "UPDATE feedbacks SET employee_id = 4 WHERE feedback_id = 15", // Rajesh
                "UPDATE feedbacks SET employee_id = 5 WHERE feedback_id = 16", // Suresh
                "UPDATE feedbacks SET employee_id = 6 WHERE feedback_id = 17", // Anita
                "UPDATE feedbacks SET employee_id = 7 WHERE feedback_id = 18", // Deepak
                "UPDATE feedbacks SET employee_id = 8 WHERE feedback_id = 19", // Sunita
                "UPDATE feedbacks SET employee_id = 9 WHERE feedback_id = 20", // Vikram
                "UPDATE feedbacks SET employee_id = 10 WHERE feedback_id = 21", // Meera
                "UPDATE feedbacks SET employee_id = 11 WHERE feedback_id = 22", // Arjun
                "UPDATE feedbacks SET employee_id = 12 WHERE feedback_id = 23", // Kavya
                "UPDATE feedbacks SET employee_id = 13 WHERE feedback_id = 24"  // Rohit
            };
            
            int totalUpdated = 0;
            for (String update : updates) {
                int rowsAffected = jdbcTemplate.update(update);
                totalUpdated += rowsAffected;
                System.out.println("Updated " + rowsAffected + " rows with: " + update);
            }
            
            return ResponseEntity.ok("Successfully updated " + totalUpdated + " feedback mappings");
            
        } catch (Exception e) {
            System.err.println("Error fixing feedback mappings: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/test-connection")
    public ResponseEntity<String> testConnection() {
        try {
            String result = jdbcTemplate.queryForObject("SELECT 'Database connected successfully'", String.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Database connection failed: " + e.getMessage());
        }
    }
}
