package com.example.springapp.model;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "appraisals")
public class Appraisal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appraisalId;

    private Integer selfRating;
    private Integer managerRating;
    private String status; // Submitted, In Review, Completed
    private String cycleName;
    private LocalDate appraisalDate;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String managerName;
    private String reviewerRole;
    private LocalDate reviewDate;

    @Column(columnDefinition = "TEXT")
    private String managerComments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({"goals", "appraisals", "feedbacks", "hibernateLazyInitializer", "handler"})
    private EmployeeProfile employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ReviewCycle reviewCycle;

    // Getters and setters
    public Long getAppraisalId() { return appraisalId; }
    public void setAppraisalId(Long appraisalId) { this.appraisalId = appraisalId; }

    public Integer getSelfRating() { return selfRating; }
    public void setSelfRating(Integer selfRating) { this.selfRating = selfRating; }

    public Integer getManagerRating() { return managerRating; }
    public void setManagerRating(Integer managerRating) { this.managerRating = managerRating; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }

    public LocalDate getAppraisalDate() { return appraisalDate; }
    public void setAppraisalDate(LocalDate appraisalDate) { this.appraisalDate = appraisalDate; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getReviewerRole() { return reviewerRole; }
    public void setReviewerRole(String reviewerRole) { this.reviewerRole = reviewerRole; }

    public LocalDate getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }

    public String getManagerComments() { return managerComments; }
    public void setManagerComments(String managerComments) { this.managerComments = managerComments; }

    public EmployeeProfile getEmployee() { return employee; }
    public void setEmployee(EmployeeProfile employee) { this.employee = employee; }

    public ReviewCycle getReviewCycle() { return reviewCycle; }
    public void setReviewCycle(ReviewCycle reviewCycle) { this.reviewCycle = reviewCycle; }
}
