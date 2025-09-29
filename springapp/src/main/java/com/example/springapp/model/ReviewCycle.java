package com.example.springapp.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "review_cycles")
public class ReviewCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cycleId;

    @Column(name = "cycle_name", nullable = false)
    private String cycleName;

    @Column(nullable = false)
    private String status; // Scheduled, In Progress, Completed

    @Column(nullable = false)
    private LocalDate deadline;

    @OneToMany(mappedBy = "reviewCycle", cascade = CascadeType.ALL)
    private List<Appraisal> appraisals;

    // Getters and setters
    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public List<Appraisal> getAppraisals() { return appraisals; }
    public void setAppraisals(List<Appraisal> appraisals) { this.appraisals = appraisals; }
}
