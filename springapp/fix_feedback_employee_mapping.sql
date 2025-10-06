-- Fix feedback employee mappings to ensure correct names are displayed
-- First, let's see the current mappings
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

-- Let's also see all employees to understand the mapping
SELECT 
    ep.employee_profile_id,
    u.full_name,
    u.first_name,
    u.last_name,
    ep.designation,
    ep.department
FROM employee_profiles ep 
JOIN users u ON ep.user_id = u.user_id 
ORDER BY ep.employee_profile_id;

-- Now let's fix the mappings based on the feedback comments
-- We need to map feedbacks to the correct employees based on their names/content

-- Update feedback 12 (Lakshmipriya's feedback) to point to Lakshmipriya's employee profile
UPDATE feedbacks SET employee_id = 1 WHERE feedback_id = 12;

-- Update feedback 13 (Nandini's feedback) to point to Nandini's employee profile  
UPDATE feedbacks SET employee_id = 2 WHERE feedback_id = 13;

-- Update feedback 14 (Priya's feedback) to point to Priya's employee profile
UPDATE feedbacks SET employee_id = 3 WHERE feedback_id = 14;

-- Update feedback 15 (Rajesh's feedback) to point to Rajesh's employee profile
UPDATE feedbacks SET employee_id = 4 WHERE feedback_id = 15;

-- Update feedback 16 (Suresh's feedback) to point to Suresh's employee profile
UPDATE feedbacks SET employee_id = 5 WHERE feedback_id = 16;

-- Update feedback 17 (Anita's feedback) to point to Anita's employee profile
UPDATE feedbacks SET employee_id = 6 WHERE feedback_id = 17;

-- Update feedback 18 (Deepak's feedback) to point to Deepak's employee profile
UPDATE feedbacks SET employee_id = 7 WHERE feedback_id = 18;

-- Update feedback 19 (Sunita's feedback) to point to Sunita's employee profile
UPDATE feedbacks SET employee_id = 8 WHERE feedback_id = 19;

-- Update feedback 20 (Vikram's feedback) to point to Vikram's employee profile
UPDATE feedbacks SET employee_id = 9 WHERE feedback_id = 20;

-- Update feedback 21 (Meera's feedback) to point to Meera's employee profile
UPDATE feedbacks SET employee_id = 10 WHERE feedback_id = 21;

-- Update feedback 22 (Arjun's feedback) to point to Arjun's employee profile
UPDATE feedbacks SET employee_id = 11 WHERE feedback_id = 22;

-- Update feedback 23 (Kavya's feedback) to point to Kavya's employee profile
UPDATE feedbacks SET employee_id = 12 WHERE feedback_id = 23;

-- Update feedback 24 (Rohit's feedback) to point to Rohit's employee profile
UPDATE feedbacks SET employee_id = 13 WHERE feedback_id = 24;

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
