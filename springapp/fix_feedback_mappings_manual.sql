-- Fix feedback employee mappings manually
-- Run these commands in your MySQL database

-- First, see current mappings
SELECT 
    f.feedback_id,
    f.employee_id,
    ep.employee_profile_id,
    u.full_name as employee_name,
    f.comments
FROM feedbacks f 
JOIN employee_profiles ep ON f.employee_id = ep.employee_profile_id 
JOIN users u ON ep.user_id = u.user_id 
ORDER BY f.feedback_id;

-- Fix the mappings - each feedback should point to the correct employee
UPDATE feedbacks SET employee_id = 1 WHERE feedback_id = 12; -- Lakshmipriya
UPDATE feedbacks SET employee_id = 2 WHERE feedback_id = 13; -- Nandini  
UPDATE feedbacks SET employee_id = 3 WHERE feedback_id = 14; -- Priya
UPDATE feedbacks SET employee_id = 4 WHERE feedback_id = 15; -- Rajesh
UPDATE feedbacks SET employee_id = 5 WHERE feedback_id = 16; -- Suresh
UPDATE feedbacks SET employee_id = 6 WHERE feedback_id = 17; -- Anita
UPDATE feedbacks SET employee_id = 7 WHERE feedback_id = 18; -- Deepak
UPDATE feedbacks SET employee_id = 8 WHERE feedback_id = 19; -- Sunita
UPDATE feedbacks SET employee_id = 9 WHERE feedback_id = 20; -- Vikram
UPDATE feedbacks SET employee_id = 10 WHERE feedback_id = 21; -- Meera
UPDATE feedbacks SET employee_id = 11 WHERE feedback_id = 22; -- Arjun
UPDATE feedbacks SET employee_id = 12 WHERE feedback_id = 23; -- Kavya
UPDATE feedbacks SET employee_id = 13 WHERE feedback_id = 24; -- Rohit

-- Verify the fixes
SELECT 
    f.feedback_id,
    f.employee_id,
    ep.employee_profile_id,
    u.full_name as employee_name,
    f.comments
FROM feedbacks f 
JOIN employee_profiles ep ON f.employee_id = ep.employee_profile_id 
JOIN users u ON ep.user_id = u.user_id 
ORDER BY f.feedback_id;
