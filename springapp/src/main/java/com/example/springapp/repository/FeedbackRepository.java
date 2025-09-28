package com.example.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.springapp.model.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find feedbacks received by an employee
    List<Feedback> findByEmployee_EmployeeProfileId(Long employeeProfileId);

    // Find feedbacks given by a reviewer (User)
    List<Feedback> findByReviewer_UserId(Long reviewerId);

    // Optional: find by employee + reviewer
    Optional<Feedback> findByEmployee_EmployeeProfileIdAndReviewer_UserId(Long employeeProfileId, Long reviewerId);

    // Find feedbacks by type
    List<Feedback> findByFeedbackType(String feedbackType);

    // Find feedbacks by rating
    List<Feedback> findByRating(Integer rating);

    // Find feedbacks by employee and type
    List<Feedback> findByEmployee_EmployeeProfileIdAndFeedbackType(Long employeeProfileId, String feedbackType);
}
