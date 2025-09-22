package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.Appraisal;
import com.example.springapp.repository.AppraisalRepository;

@Service
public class AppraisalService {

    private final AppraisalRepository repo;

    public AppraisalService(AppraisalRepository repo) {
        this.repo = repo;
    }

    public List<Appraisal> getAllAppraisals() {
        return repo.findAll();
    }

    public Optional<Appraisal> getAppraisalById(Long id) {
        return repo.findById(id);
    }

    public List<Appraisal> getAppraisalsByEmployeeId(Long employeeId) {
        return repo.findByEmployee_EmployeeProfileId(employeeId);
    }

    public List<Appraisal> getAppraisalsByCycleId(Long cycleId) {
        return repo.findByReviewCycle_CycleId(cycleId);
    }

    public Appraisal createAppraisal(Appraisal appraisal) {
        if (appraisal.getEmployee() == null || appraisal.getReviewCycle() == null) {
            throw new IllegalArgumentException("Employee and ReviewCycle must be set for Appraisal");
        }
        return repo.save(appraisal);
    }

    public Appraisal updateAppraisal(Appraisal appraisal) {
        return repo.save(appraisal);
    }

    public void deleteAppraisal(Long id) {
        repo.deleteById(id);
    }
}
