package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    private String comments;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private EmployeeProfile employee;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;
}
