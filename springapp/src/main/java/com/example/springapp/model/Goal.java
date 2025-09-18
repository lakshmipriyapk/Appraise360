package com.example.springapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long goalId;

    private String title;
    private String description;
    private String status; // Pending, In Progress, Completed

    // Many goals belong to one employee
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private EmployeeProfile employee;

    // Optional: Many goals can belong to one appraisal
    @ManyToOne
    @JoinColumn(name = "appraisal_id")
    private Appraisal appraisal;

}
