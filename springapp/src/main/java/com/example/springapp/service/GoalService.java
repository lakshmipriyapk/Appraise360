package com.example.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.springapp.model.Goal;
import com.example.springapp.repository.GoalRepository;

@Service
public class GoalService {

    private final GoalRepository repo;

    public GoalService(GoalRepository repo) {
        this.repo = repo;
    }

    public List<Goal> getAllGoals() {
        return repo.findAll();
    }

    public Optional<Goal> getGoalById(Long id) {
        return repo.findById(id);
    }

    public List<Goal> getGoalsByEmployeeId(Long employeeProfileId) {
        return repo.findByEmployee_EmployeeProfileId(employeeProfileId);
    }

    public List<Goal> getGoalsByAppraisalId(Long appraisalId) {
        return repo.findByAppraisal_AppraisalId(appraisalId);
    }

    public Goal createGoal(Goal goal) {
        if (goal.getEmployee() == null) {
            throw new IllegalArgumentException("Goal must be linked to an EmployeeProfile");
        }
        return repo.save(goal);
    }

    public Goal updateGoal(Goal goal) {
        return repo.save(goal);
    }

    public void deleteGoal(Long id) {
        repo.deleteById(id);
    }
}
