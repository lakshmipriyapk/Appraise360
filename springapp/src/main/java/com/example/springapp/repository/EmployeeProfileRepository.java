package com.example.springapp.repository;

import com.example.springapp.model.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {

    // Find profile by employeeProfileId
    List<EmployeeProfile> findByEmployeeProfileId(Long employeeProfileId);

    // Find profile(s) by userId
    List<EmployeeProfile> findByUserUserId(Long userId);  // userUserId matches the field "userId" in User entity
}
