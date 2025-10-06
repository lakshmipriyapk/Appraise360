-- Fix feedback records to include proper employee_id references
-- This will link each feedback to the correct employee profile

-- Update feedbacks to link to employee profiles
-- We'll distribute feedbacks across different employees

UPDATE feedbacks SET employee_id = 2 WHERE feedback_id = 12;  -- Lakshmipriya P K
UPDATE feedbacks SET employee_id = 3 WHERE feedback_id = 13;  -- Nandhini S Y  
UPDATE feedbacks SET employee_id = 4 WHERE feedback_id = 14;  -- Sharada D V
UPDATE feedbacks SET employee_id = 5 WHERE feedback_id = 15;  -- Alice Doe
UPDATE feedbacks SET employee_id = 6 WHERE feedback_id = 16;  -- Alice Two
UPDATE feedbacks SET employee_id = 7 WHERE feedback_id = 17;  -- Shailaja P K
UPDATE feedbacks SET employee_id = 8 WHERE feedback_id = 18;  -- Thanuja P K
UPDATE feedbacks SET employee_id = 9 WHERE feedback_id = 19;  -- John Doe
UPDATE feedbacks SET employee_id = 10 WHERE feedback_id = 20; -- Alice Smith
UPDATE feedbacks SET employee_id = 11 WHERE feedback_id = 21; -- Bob Jones
UPDATE feedbacks SET employee_id = 12 WHERE feedback_id = 22; -- Carol Lee
UPDATE feedbacks SET employee_id = 13 WHERE feedback_id = 23; -- David Kim
UPDATE feedbacks SET employee_id = 14 WHERE feedback_id = 24; -- Pallavi B

-- Verify the updates
SELECT f.feedback_id, f.employee_id, ep.employee_profile_id, u.fullName as employee_name, f.reviewer_id, r.fullName as reviewer_name
FROM feedbacks f
LEFT JOIN employee_profiles ep ON f.employee_id = ep.employee_profile_id
LEFT JOIN users u ON ep.user_id = u.userId
LEFT JOIN users r ON f.reviewer_id = r.userId
ORDER BY f.feedback_id;

