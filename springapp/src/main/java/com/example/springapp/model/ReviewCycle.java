package com.example.springapp.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class ReviewCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cycleId;

    private String cycleName;

    @OneToMany(mappedBy = "reviewCycle", cascade = CascadeType.ALL)
    private List<Appraisal> appraisals;
}
