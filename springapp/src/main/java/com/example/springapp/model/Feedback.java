package com.example.springapp.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @Column(name = "feedback_type")
    private String feedbackType; // Peer Feedback, Manager Feedback, Self-Feedback

    @Column(columnDefinition = "TEXT")
    private String comments;

    private Integer rating; // Optional rating (1-5)

    // Additional fields for self-feedback form
    @Column(columnDefinition = "TEXT")
    private String achievements; // For self feedback

    @Column(columnDefinition = "TEXT")
    private String challenges; // For self feedback

    @Column(columnDefinition = "TEXT")
    private String improvements; // For self feedback

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private EmployeeProfile employee;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer; // Can be manager, peer, or self

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    // Getters and setters
    public Long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }

    public String getFeedbackType() { return feedbackType; }
    public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getImprovements() { return improvements; }
    public void setImprovements(String improvements) { this.improvements = improvements; }

    public EmployeeProfile getEmployee() { return employee; }
    public void setEmployee(EmployeeProfile employee) { this.employee = employee; }

    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    @PrePersist
    private void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = LocalDateTime.now();
        }
    }
}
