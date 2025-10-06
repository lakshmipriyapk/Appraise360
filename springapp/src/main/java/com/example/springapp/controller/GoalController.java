
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
    public ResponseEntity<Goal> createGoal(@RequestBody java.util.Map<String, Object> goalData) {
        try {
            System.out.println("Creating goal with data: " + goalData);
            
            // Create a new Goal object
            Goal goal = new Goal();
            
            // Set basic fields
            if (goalData.containsKey("title")) {
                goal.setTitle((String) goalData.get("title"));
            }
            if (goalData.containsKey("description")) {
                goal.setDescription((String) goalData.get("description"));
            }
            if (goalData.containsKey("status")) {
                goal.setStatus((String) goalData.get("status"));
            } else {
                goal.setStatus("Pending"); // Default status
            }
            if (goalData.containsKey("priority")) {
                goal.setPriority((String) goalData.get("priority"));
            }
            if (goalData.containsKey("category")) {
                goal.setCategory((String) goalData.get("category"));
            }
            if (goalData.containsKey("created_by")) {
                goal.setCreatedBy((String) goalData.get("created_by"));
            } else {
                goal.setCreatedBy("manager"); // Default
            }
            if (goalData.containsKey("manager_comments")) {
                goal.setManagerComments((String) goalData.get("manager_comments"));
            }
            
            // Handle progress
            if (goalData.containsKey("progress")) {
                Object progressObj = goalData.get("progress");
                if (progressObj != null) {
                    if (progressObj instanceof Integer) {
                        goal.setProgress((Integer) progressObj);
                    } else if (progressObj instanceof String) {
                        try {
                            goal.setProgress(Integer.parseInt((String) progressObj));
                        } catch (NumberFormatException e) {
                            goal.setProgress(0);
                        }
                    }
                } else {
                    goal.setProgress(0);
                }
            } else {
                goal.setProgress(0);
            }
            
            // Handle date fields
            if (goalData.containsKey("start_date")) {
                String startDateStr = (String) goalData.get("start_date");
                if (startDateStr != null && !startDateStr.isEmpty()) {
                    goal.setStartDate(java.time.LocalDate.parse(startDateStr));
                }
            } else if (goalData.containsKey("startDate")) {
                String startDateStr = (String) goalData.get("startDate");
                if (startDateStr != null && !startDateStr.isEmpty()) {
                    goal.setStartDate(java.time.LocalDate.parse(startDateStr));
                }
            }
            
            if (goalData.containsKey("target_date")) {
                String targetDateStr = (String) goalData.get("target_date");
                if (targetDateStr != null && !targetDateStr.isEmpty()) {
                    goal.setTargetDate(java.time.LocalDate.parse(targetDateStr));
                }
            } else if (goalData.containsKey("targetDate")) {
                String targetDateStr = (String) goalData.get("targetDate");
                if (targetDateStr != null && !targetDateStr.isEmpty()) {
                    goal.setTargetDate(java.time.LocalDate.parse(targetDateStr));
                }
            } else if (goalData.containsKey("endDate")) {
                String endDateStr = (String) goalData.get("endDate");
                if (endDateStr != null && !endDateStr.isEmpty()) {
                    goal.setTargetDate(java.time.LocalDate.parse(endDateStr));
                }
            }
            
            if (goalData.containsKey("completion_date")) {
                String completionDateStr = (String) goalData.get("completion_date");
                if (completionDateStr != null && !completionDateStr.isEmpty()) {
                    goal.setCompletionDate(java.time.LocalDate.parse(completionDateStr));
                }
            } else if (goalData.containsKey("completionDate")) {
                String completionDateStr = (String) goalData.get("completionDate");
                if (completionDateStr != null && !completionDateStr.isEmpty()) {
                    goal.setCompletionDate(java.time.LocalDate.parse(completionDateStr));
                }
            }
            
            // Handle employee relationship
            Long employeeId = null;
            if (goalData.containsKey("employee_id")) {
                Object employeeIdObj = goalData.get("employee_id");
                if (employeeIdObj instanceof Integer) {
                    employeeId = ((Integer) employeeIdObj).longValue();
                } else if (employeeIdObj instanceof String) {
                    employeeId = Long.parseLong((String) employeeIdObj);
                } else {
                    employeeId = (Long) employeeIdObj;
                }
            } else if (goalData.containsKey("employeeId")) {
                Object employeeIdObj = goalData.get("employeeId");
                if (employeeIdObj instanceof Integer) {
                    employeeId = ((Integer) employeeIdObj).longValue();
                } else if (employeeIdObj instanceof String) {
                    employeeId = Long.parseLong((String) employeeIdObj);
                } else {
                    employeeId = (Long) employeeIdObj;
                }
            }
            
            if (employeeId == null) {
            return ResponseEntity.badRequest().build();
        }

            final Long finalEmployeeId = employeeId;
            EmployeeProfile employee = employeeService.getEmployeeProfileById(finalEmployeeId)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + finalEmployeeId));
        goal.setEmployee(employee);

            // Handle appraisal relationship if provided
            Long appraisalId = null;
            if (goalData.containsKey("appraisal_id")) {
                Object appraisalIdObj = goalData.get("appraisal_id");
                if (appraisalIdObj instanceof Integer) {
                    appraisalId = ((Integer) appraisalIdObj).longValue();
                } else if (appraisalIdObj instanceof String) {
                    appraisalId = Long.parseLong((String) appraisalIdObj);
                } else {
                    appraisalId = (Long) appraisalIdObj;
                }
            } else if (goalData.containsKey("appraisalId")) {
                Object appraisalIdObj = goalData.get("appraisalId");
                if (appraisalIdObj instanceof Integer) {
                    appraisalId = ((Integer) appraisalIdObj).longValue();
                } else if (appraisalIdObj instanceof String) {
                    appraisalId = Long.parseLong((String) appraisalIdObj);
                } else {
                    appraisalId = (Long) appraisalIdObj;
                }
            }
            
            if (appraisalId != null) {
                final Long finalAppraisalId = appraisalId;
                Appraisal appraisal = appraisalService.getAppraisalById(finalAppraisalId)
                        .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Appraisal not found with ID " + finalAppraisalId));
            goal.setAppraisal(appraisal);
        }

            Goal createdGoal = goalService.createGoal(goal);
            System.out.println("Goal created successfully: " + createdGoal.getGoalId());
            return ResponseEntity.ok(createdGoal);
            
        } catch (Exception e) {
            System.err.println("Error creating goal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
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
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody java.util.Map<String, Object> goalData) {
        try {
            // Get the existing goal first
            Goal existingGoal = goalService.getGoalById(id)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Goal not found with ID " + id));
            
            System.out.println("Updating goal ID: " + id);
            System.out.println("Received data: " + goalData);
            
            // Update only the mutable fields, preserving relationships
            // Handle all exact database column names
            if (goalData.containsKey("title")) {
                existingGoal.setTitle((String) goalData.get("title"));
            }
            if (goalData.containsKey("description")) {
                existingGoal.setDescription((String) goalData.get("description"));
            }
            if (goalData.containsKey("status")) {
                existingGoal.setStatus((String) goalData.get("status"));
            }
            if (goalData.containsKey("priority")) {
                existingGoal.setPriority((String) goalData.get("priority"));
            }
            if (goalData.containsKey("category")) {
                existingGoal.setCategory((String) goalData.get("category"));
            }
            if (goalData.containsKey("created_by")) {
                existingGoal.setCreatedBy((String) goalData.get("created_by"));
            }
            if (goalData.containsKey("manager_comments")) {
                existingGoal.setManagerComments((String) goalData.get("manager_comments"));
            }
            
            // Handle date fields with multiple possible field names
            if (goalData.containsKey("start_date")) {
                String startDateStr = (String) goalData.get("start_date");
                if (startDateStr != null && !startDateStr.isEmpty()) {
                    existingGoal.setStartDate(java.time.LocalDate.parse(startDateStr));
                }
            } else if (goalData.containsKey("startDate")) {
                String startDateStr = (String) goalData.get("startDate");
                if (startDateStr != null && !startDateStr.isEmpty()) {
                    existingGoal.setStartDate(java.time.LocalDate.parse(startDateStr));
                }
            }
            
            if (goalData.containsKey("target_date")) {
                String targetDateStr = (String) goalData.get("target_date");
                if (targetDateStr != null && !targetDateStr.isEmpty()) {
                    existingGoal.setTargetDate(java.time.LocalDate.parse(targetDateStr));
                }
            } else if (goalData.containsKey("targetDate")) {
                String targetDateStr = (String) goalData.get("targetDate");
                if (targetDateStr != null && !targetDateStr.isEmpty()) {
                    existingGoal.setTargetDate(java.time.LocalDate.parse(targetDateStr));
                }
            } else if (goalData.containsKey("endDate")) {
                String endDateStr = (String) goalData.get("endDate");
                if (endDateStr != null && !endDateStr.isEmpty()) {
                    existingGoal.setTargetDate(java.time.LocalDate.parse(endDateStr));
                }
            }
            
            if (goalData.containsKey("completion_date")) {
                String completionDateStr = (String) goalData.get("completion_date");
                if (completionDateStr != null && !completionDateStr.isEmpty()) {
                    existingGoal.setCompletionDate(java.time.LocalDate.parse(completionDateStr));
                }
            } else if (goalData.containsKey("completionDate")) {
                String completionDateStr = (String) goalData.get("completionDate");
                if (completionDateStr != null && !completionDateStr.isEmpty()) {
                    existingGoal.setCompletionDate(java.time.LocalDate.parse(completionDateStr));
                }
            }
            
            // Handle progress field with multiple possible field names
            if (goalData.containsKey("progress")) {
                Object progressObj = goalData.get("progress");
                if (progressObj != null) {
                    if (progressObj instanceof Integer) {
                        existingGoal.setProgress((Integer) progressObj);
                    } else if (progressObj instanceof String) {
                        try {
                            existingGoal.setProgress(Integer.parseInt((String) progressObj));
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid progress value: " + progressObj);
                        }
                    }
                }
            } else if (goalData.containsKey("progressPercentage")) {
                Object progressObj = goalData.get("progressPercentage");
                if (progressObj != null) {
                    if (progressObj instanceof Integer) {
                        existingGoal.setProgress((Integer) progressObj);
                    } else if (progressObj instanceof String) {
                        try {
                            existingGoal.setProgress(Integer.parseInt((String) progressObj));
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid progressPercentage value: " + progressObj);
                        }
                    }
                }
            }
            
            // Handle employee relationship if provided (support both field names)
            if (goalData.containsKey("employee_id") || goalData.containsKey("employeeId")) {
                Object employeeIdObj = goalData.get("employee_id") != null ? goalData.get("employee_id") : goalData.get("employeeId");
                if (employeeIdObj != null) {
                    Long employeeId;
                    if (employeeIdObj instanceof Integer) {
                        employeeId = ((Integer) employeeIdObj).longValue();
                    } else if (employeeIdObj instanceof String) {
                        employeeId = Long.parseLong((String) employeeIdObj);
                    } else {
                        employeeId = (Long) employeeIdObj;
                    }
                    
                    EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Employee not found with ID " + employeeId));
                    existingGoal.setEmployee(employee);
                }
            }
            
            // Handle appraisal relationship if provided (support both field names)
            if (goalData.containsKey("appraisal_id") || goalData.containsKey("appraisalId")) {
                Object appraisalIdObj = goalData.get("appraisal_id") != null ? goalData.get("appraisal_id") : goalData.get("appraisalId");
                if (appraisalIdObj != null) {
                    Long appraisalId;
                    if (appraisalIdObj instanceof Integer) {
                        appraisalId = ((Integer) appraisalIdObj).longValue();
                    } else if (appraisalIdObj instanceof String) {
                        appraisalId = Long.parseLong((String) appraisalIdObj);
                    } else {
                        appraisalId = (Long) appraisalIdObj;
                    }
                    
                    Appraisal appraisal = appraisalService.getAppraisalById(appraisalId)
                            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Appraisal not found with ID " + appraisalId));
                    existingGoal.setAppraisal(appraisal);
                }
            }
            
            Goal updatedGoal = goalService.updateGoal(existingGoal);
            System.out.println("Goal updated successfully: " + updatedGoal.getGoalId());
            return ResponseEntity.ok(updatedGoal);
            
        } catch (Exception e) {
            System.err.println("Error updating goal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
