-- Comprehensive Data Initialization Script
-- This script ensures all tables have proper data for the admin dashboard

-- Clear existing data (be careful in production!)
-- DELETE FROM appraisals;
-- DELETE FROM feedbacks;
-- DELETE FROM goals;
-- DELETE FROM employee_profiles;
-- DELETE FROM users;

-- Insert Admin User - Let auto-increment handle IDs
INSERT INTO users (username, email, password, first_name, last_name, full_name, phone_number, role) VALUES
('admin', 'admin@appraise360.com', 'Admin@123', 'Admin', 'User', 'Admin User', '5550000000', 'Admin')
ON DUPLICATE KEY UPDATE 
username = VALUES(username),
email = VALUES(email),
password = VALUES(password),
first_name = VALUES(first_name),
last_name = VALUES(last_name),
full_name = VALUES(full_name),
phone_number = VALUES(phone_number),
role = VALUES(role);

-- Additional data will be created through the application
