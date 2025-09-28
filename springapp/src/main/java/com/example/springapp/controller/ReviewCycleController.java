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
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.springapp.model.ReviewCycle;
import com.example.springapp.service.ReviewCycleService;

@RestController
@RequestMapping("/api/reviewCycles")
public class ReviewCycleController {

    private final ReviewCycleService service;

    public ReviewCycleController(ReviewCycleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ReviewCycle>> getAllReviewCycles() {
        return ResponseEntity.ok(service.getAllReviewCycles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewCycle> getReviewCycleById(@PathVariable Long id) {
        return service.getReviewCycleById(id)
                      .map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReviewCycle> createReviewCycle(@RequestBody ReviewCycle cycle) {
        return ResponseEntity.ok(service.createReviewCycle(cycle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewCycle> updateReviewCycle(@PathVariable Long id, @RequestBody ReviewCycle cycle) {
        cycle.setCycleId(id);
        return ResponseEntity.ok(service.updateReviewCycle(cycle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReviewCycle(@PathVariable Long id) {
        service.deleteReviewCycle(id);
        return ResponseEntity.noContent().build();
    }
}
