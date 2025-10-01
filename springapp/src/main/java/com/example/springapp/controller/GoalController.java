package com.example.springapp.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.model.Goal;
import com.example.springapp.model.EmployeeProfile;
import com.example.springapp.model.Appraisal;
import com.example.springapp.service.GoalService;
import com.example.springapp.service.EmployeeProfileService;
import com.example.springapp.service.AppraisalService;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class GoalController {

    private final GoalService goalService;
    private final EmployeeProfileService employeeService;
    private final AppraisalService appraisalService;

    public GoalController(GoalService goalService,
                          EmployeeProfileService employeeService,
                          AppraisalService appraisalService) {
        this.goalService = goalService;
        this.employeeService = employeeService;
        this.appraisalService = appraisalService;
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals() {
        return ResponseEntity.ok(goalService.getAllGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id) {
        return goalService.getGoalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Goal>> getGoalsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(goalService.getGoalsByEmployeeId(employeeId));
    }

    @GetMapping("/appraisal/{appraisalId}")
    public ResponseEntity<List<Goal>> getGoalsByAppraisal(@PathVariable Long appraisalId) {
        return ResponseEntity.ok(goalService.getGoalsByAppraisalId(appraisalId));
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        // Validate required fields
        if (goal.getEmployee() == null || goal.getEmployee().getEmployeeProfileId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Get employee
        EmployeeProfile employee = employeeService.getEmployeeProfileById(goal.getEmployee().getEmployeeProfileId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + goal.getEmployee().getEmployeeProfileId()));
        goal.setEmployee(employee);

        // Handle appraisal if provided
        if (goal.getAppraisal() != null && goal.getAppraisal().getAppraisalId() != null) {
            Appraisal appraisal = appraisalService.getAppraisalById(goal.getAppraisal().getAppraisalId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Appraisal not found with ID " + goal.getAppraisal().getAppraisalId()));
            goal.setAppraisal(appraisal);
        }

        return ResponseEntity.ok(goalService.createGoal(goal));
    }

    @PostMapping(value = "/employee/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> createGoalWithEmployeeId(@PathVariable Long employeeId,
                                                         @RequestBody Goal goal) {
        EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + employeeId));
        goal.setEmployee(employee);

        return ResponseEntity.ok(goalService.createGoal(goal));
    }

    @PostMapping(value = "/employee/{employeeId}/appraisal/{appraisalId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> createGoalWithAppraisal(@PathVariable Long employeeId,
                                                        @PathVariable Long appraisalId,
                                                        @RequestBody Goal goal) {
        EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + employeeId));
        Appraisal appraisal = appraisalService.getAppraisalById(appraisalId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Appraisal not found with ID " + appraisalId));

        goal.setEmployee(employee);
        goal.setAppraisal(appraisal);

        return ResponseEntity.ok(goalService.createGoal(goal));
    }

    @PutMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        goal.setGoalId(id);
        return ResponseEntity.ok(goalService.updateGoal(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
