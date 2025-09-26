package com.example.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.Goal;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    // Find goals for an employee
    List<Goal> findByEmployee_EmployeeProfileId(Long employeeProfileId);

    // Optional: find goals for a specific appraisal
    List<Goal> findByAppraisal_AppraisalId(Long appraisalId);

    // Optional: find by employee + appraisal
    Optional<Goal> findByEmployee_EmployeeProfileIdAndAppraisal_AppraisalId(Long employeeProfileId, Long appraisalId);

    // Find goals by status
    List<Goal> findByStatus(String status);

    // Find goals by created by (manager or self)
    List<Goal> findByCreatedBy(String createdBy);

    // Find goals by category
    List<Goal> findByCategory(String category);

    // Find goals by employee and status
    List<Goal> findByEmployee_EmployeeProfileIdAndStatus(Long employeeProfileId, String status);
}
