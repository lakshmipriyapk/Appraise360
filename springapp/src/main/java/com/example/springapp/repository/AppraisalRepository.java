package com.example.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.Appraisal;

@Repository
public interface AppraisalRepository extends JpaRepository<Appraisal, Long> {

    // Find all appraisals for a specific employee
    List<Appraisal> findByEmployee_EmployeeProfileId(Long employeeProfileId);

    // Find all appraisals for a specific review cycle
    List<Appraisal> findByReviewCycle_CycleId(Long cycleId);
}
