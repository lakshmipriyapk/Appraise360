package com.example.springapp.model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@Table(name = "employee_profiles")
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeProfileId;

    private String department;
    private String designation;
    private String dateOfJoining;
    private String reportingManager;
    private String currentProject;
    private String currentTeam;
    @Column(columnDefinition = "TEXT")
    private String skills;
    private Double lastAppraisalRating;
    @Column(columnDefinition = "TEXT")
    private String currentGoals;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"employeeProfiles", "hibernateLazyInitializer", "handler"})
    private User user;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnoreProperties({"employee", "appraisal"})
    private List<Goal> goals;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnoreProperties({"employee"})
    private List<Appraisal> appraisals;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnoreProperties({"employee", "reviewer"})
    private List<Feedback> feedbacks;

    // getters and setters
    public Long getEmployeeProfileId() { return employeeProfileId; }
    public void setEmployeeProfileId(Long employeeProfileId) { this.employeeProfileId = employeeProfileId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(String dateOfJoining) { this.dateOfJoining = dateOfJoining; }
    public String getReportingManager() { return reportingManager; }
    public void setReportingManager(String reportingManager) { this.reportingManager = reportingManager; }
    public String getCurrentProject() { return currentProject; }
    public void setCurrentProject(String currentProject) { this.currentProject = currentProject; }
    public String getCurrentTeam() { return currentTeam; }
    public void setCurrentTeam(String currentTeam) { this.currentTeam = currentTeam; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public Double getLastAppraisalRating() { return lastAppraisalRating; }
    public void setLastAppraisalRating(Double lastAppraisalRating) { this.lastAppraisalRating = lastAppraisalRating; }
    public String getCurrentGoals() { return currentGoals; }
    public void setCurrentGoals(String currentGoals) { this.currentGoals = currentGoals; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }
    public List<Appraisal> getAppraisals() { return appraisals; }
    public void setAppraisals(List<Appraisal> appraisals) { this.appraisals = appraisals; }
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}
