    package com.example.springapp.controller;

    import java.util.List;

    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.CrossOrigin;
    import org.springframework.web.bind.annotation.DeleteMapping;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.PutMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.example.springapp.model.Appraisal;
    import com.example.springapp.model.EmployeeProfile;
    import com.example.springapp.model.ReviewCycle;
    import com.example.springapp.service.AppraisalService;
    import com.example.springapp.service.EmployeeProfileService;
    import com.example.springapp.service.ReviewCycleService;

    @RestController
    @RequestMapping("/api/appraisals")
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public class AppraisalController {

        private final AppraisalService appraisalService;
        private final EmployeeProfileService employeeService;
        private final ReviewCycleService reviewCycleService;

        public AppraisalController(AppraisalService appraisalService,
                                EmployeeProfileService employeeService,
                                ReviewCycleService reviewCycleService) {
            this.appraisalService = appraisalService;
            this.employeeService = employeeService;
            this.reviewCycleService = reviewCycleService;
        }

        @GetMapping
        public ResponseEntity<List<Appraisal>> getAllAppraisals() {
            return ResponseEntity.ok(appraisalService.getAllAppraisals());
        }

        @GetMapping("/{id}")
        public ResponseEntity<Appraisal> getAppraisalById(@PathVariable Long id) {
            return appraisalService.getAppraisalById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/employee/{employeeId}")
        public ResponseEntity<List<Appraisal>> getAppraisalsByEmployee(@PathVariable Long employeeId) {
            return ResponseEntity.ok(appraisalService.getAppraisalsByEmployeeId(employeeId));
        }

        @GetMapping("/cycle/{cycleId}")
        public ResponseEntity<List<Appraisal>> getAppraisalsByCycle(@PathVariable Long cycleId) {
            return ResponseEntity.ok(appraisalService.getAppraisalsByCycleId(cycleId));
        }

        @PostMapping
        public ResponseEntity<Appraisal> createAppraisal(@RequestBody Appraisal appraisal) {
            // Validate required fields
            if (appraisal.getEmployee() == null || appraisal.getEmployee().getEmployeeProfileId() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Get employee and review cycle
            EmployeeProfile employee = employeeService.getEmployeeProfileById(appraisal.getEmployee().getEmployeeProfileId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID " + appraisal.getEmployee().getEmployeeProfileId()));
            
            ReviewCycle cycle = null;
            if (appraisal.getReviewCycle() != null && appraisal.getReviewCycle().getCycleId() != null) {
                cycle = reviewCycleService.getReviewCycleById(appraisal.getReviewCycle().getCycleId())
                        .orElseThrow(() -> new RuntimeException("ReviewCycle not found with ID " + appraisal.getReviewCycle().getCycleId()));
            }

            appraisal.setEmployee(employee);
            appraisal.setReviewCycle(cycle);

            return ResponseEntity.ok(appraisalService.createAppraisal(appraisal));
        }

        @PostMapping("/employee/{employeeId}/cycle/{cycleId}")
        public ResponseEntity<Appraisal> createAppraisalWithIds(@PathVariable Long employeeId,
                                                            @PathVariable Long cycleId,
                                                            @RequestBody java.util.Map<String, Object> appraisalData) {
            try {
                System.out.println("Creating appraisal for employee " + employeeId + " in cycle " + cycleId + " with data: " + appraisalData);
                
                EmployeeProfile employee = employeeService.getEmployeeProfileById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Employee not found with ID " + employeeId));
                ReviewCycle cycle = reviewCycleService.getReviewCycleById(cycleId)
                        .orElseThrow(() -> new RuntimeException("ReviewCycle not found with ID " + cycleId));

                // Create new Appraisal object
                Appraisal appraisal = new Appraisal();
                
                // Set basic fields from the map
                if (appraisalData.containsKey("status")) {
                    appraisal.setStatus((String) appraisalData.get("status"));
                } else {
                    appraisal.setStatus("Draft");
                }
                
                if (appraisalData.containsKey("selfRating")) {
                    Object rating = appraisalData.get("selfRating");
                    if (rating instanceof Integer) {
                        appraisal.setSelfRating((Integer) rating);
                    } else if (rating instanceof String) {
                        appraisal.setSelfRating(Integer.parseInt((String) rating));
                    }
                } else {
                    appraisal.setSelfRating(0);
                }
                
                if (appraisalData.containsKey("managerRating")) {
                    Object rating = appraisalData.get("managerRating");
                    if (rating instanceof Integer) {
                        appraisal.setManagerRating((Integer) rating);
                    } else if (rating instanceof String) {
                        appraisal.setManagerRating(Integer.parseInt((String) rating));
                    }
                } else {
                    appraisal.setManagerRating(0);
                }
                
                if (appraisalData.containsKey("cycleName")) {
                    appraisal.setCycleName((String) appraisalData.get("cycleName"));
                }
                
                if (appraisalData.containsKey("periodStart")) {
                    String periodStartStr = (String) appraisalData.get("periodStart");
                    if (periodStartStr != null && !periodStartStr.isEmpty()) {
                        appraisal.setPeriodStart(java.time.LocalDate.parse(periodStartStr));
                    }
                }
                
                if (appraisalData.containsKey("periodEnd")) {
                    String periodEndStr = (String) appraisalData.get("periodEnd");
                    if (periodEndStr != null && !periodEndStr.isEmpty()) {
                        appraisal.setPeriodEnd(java.time.LocalDate.parse(periodEndStr));
                    }
                }
                
                if (appraisalData.containsKey("managerComments")) {
                    appraisal.setManagerComments((String) appraisalData.get("managerComments"));
                }
                
                if (appraisalData.containsKey("reviewerRole")) {
                    appraisal.setReviewerRole((String) appraisalData.get("reviewerRole"));
                }

                // Set relationships
                appraisal.setEmployee(employee);
                appraisal.setReviewCycle(cycle);

                Appraisal createdAppraisal = appraisalService.createAppraisal(appraisal);
                System.out.println("Successfully created appraisal with ID: " + createdAppraisal.getAppraisalId());
                
                return ResponseEntity.ok(createdAppraisal);
                
            } catch (Exception e) {
                System.err.println("Error creating appraisal: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        }

        @PutMapping("/{id}")
        public ResponseEntity<Appraisal> updateAppraisal(@PathVariable Long id, @RequestBody Appraisal appraisal) {
            appraisal.setAppraisalId(id);
            return ResponseEntity.ok(appraisalService.updateAppraisal(appraisal));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteAppraisal(@PathVariable Long id) {
            appraisalService.deleteAppraisal(id);
            return ResponseEntity.noContent().build();
        }
    }
