package com.example.springapp.model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee_profile")
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_profile_id")
    private Long employeeProfileId;

    @Column(length = 255)
    private String department;

    @Column(length = 255)
    private String designation;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(name = "reporting_manager")
    private String reportingManager;

    @Column(name = "current_project")
    private String currentProject;

    @Column(name = "current_team")
    private String currentTeam;

    @ElementCollection
    @Column(name = "skills")
    private List<String> skills;

    @Column(name = "last_appraisal_rating")
    private Double lastAppraisalRating;

    @ElementCollection
    @Column(name = "current_goals")
    private List<String> currentGoals;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // references User.user_id
    private User user;

    @OneToMany(mappedBy = "employee", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Goal> goals;

    @OneToMany(mappedBy = "employee", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Appraisal> appraisals;

    @OneToMany(mappedBy = "employee", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Feedback> feedbacks;

    // Getters and setters
    public Long getEmployeeProfileId() { return employeeProfileId; }
    public void setEmployeeProfileId(Long employeeProfileId) { this.employeeProfileId = employeeProfileId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }

    public String getReportingManager() { return reportingManager; }
    public void setReportingManager(String reportingManager) { this.reportingManager = reportingManager; }

    public String getCurrentProject() { return currentProject; }
    public void setCurrentProject(String currentProject) { this.currentProject = currentProject; }

    public String getCurrentTeam() { return currentTeam; }
    public void setCurrentTeam(String currentTeam) { this.currentTeam = currentTeam; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Double getLastAppraisalRating() { return lastAppraisalRating; }
    public void setLastAppraisalRating(Double lastAppraisalRating) { this.lastAppraisalRating = lastAppraisalRating; }

    public List<String> getCurrentGoals() { return currentGoals; }
    public void setCurrentGoals(List<String> currentGoals) { this.currentGoals = currentGoals; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }

    public List<Appraisal> getAppraisals() { return appraisals; }
    public void setAppraisals(List<Appraisal> appraisals) { this.appraisals = appraisals; }

    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}
