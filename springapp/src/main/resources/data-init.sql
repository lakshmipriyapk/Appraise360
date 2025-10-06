-- Comprehensive Data Initialization Script
-- This script ensures all tables have proper data for the admin dashboard

-- Clear existing data (be careful in production!)
-- DELETE FROM appraisals;
-- DELETE FROM feedbacks;
-- DELETE FROM goals;
-- DELETE FROM employee_profiles;
-- DELETE FROM users;

-- Insert Users (13 employees + 1 admin)
INSERT INTO users (user_id, username, email, password, first_name, last_name, full_name, phone_number, role) VALUES
(1, 'nandu123', 'nandu123@gmail.com', 'Nandu@123', 'Nandhini', 'S Y', 'Nandhini S Y', '7891234567', 'Employee'),
(2, 'sharada123', 'sharada123@gmail.com', 'Sharada@123', 'Sharada', 'D V', 'Sharada D V', '9876543210', 'Employee'),
(3, 'lakshmi123', 'lakshmipriya15042002@gmail.com', 'Lakshmi@2002', 'Lakshmipriya', 'P K', 'Lakshmipriya P K', '8197757797', 'Employee'),
(4, 'alice123', 'alice.doe@example.com', 'Alice@123', 'Alice', 'Doe', 'Alice Doe', '5551234567', 'Employee'),
(5, 'shailaja123', 'shailaja.pk@example.com', 'Shailaja@123', 'Shailaja', 'P K', 'Shailaja P K', '5552345678', 'Employee'),
(6, 'rajesh123', 'rajesh.kumar@example.com', 'Rajesh@123', 'Rajesh', 'Kumar', 'Rajesh Kumar', '5553456789', 'Employee'),
(7, 'suresh123', 'suresh.singh@example.com', 'Suresh@123', 'Suresh', 'Singh', 'Suresh Singh', '5554567890', 'Employee'),
(8, 'anita123', 'anita.sharma@example.com', 'Anita@123', 'Anita', 'Sharma', 'Anita Sharma', '5555678901', 'Employee'),
(9, 'deepak123', 'deepak.gupta@example.com', 'Deepak@123', 'Deepak', 'Gupta', 'Deepak Gupta', '5556789012', 'Employee'),
(10, 'sunita123', 'sunita.patel@example.com', 'Sunita@123', 'Sunita', 'Patel', 'Sunita Patel', '5557890123', 'Employee'),
(11, 'vikram123', 'vikram.jain@example.com', 'Vikram@123', 'Vikram', 'Jain', 'Vikram Jain', '5558901234', 'Employee'),
(12, 'meera123', 'meera.reddy@example.com', 'Meera@123', 'Meera', 'Reddy', 'Meera Reddy', '5559012345', 'Employee'),
(13, 'arjun123', 'arjun.malhotra@example.com', 'Arjun@123', 'Arjun', 'Malhotra', 'Arjun Malhotra', '5550123456', 'Employee'),
(14, 'admin', 'admin@appraise360.com', 'Admin@123', 'Admin', 'User', 'Admin User', '5550000000', 'Admin')
ON DUPLICATE KEY UPDATE 
username = VALUES(username),
email = VALUES(email),
password = VALUES(password),
first_name = VALUES(first_name),
last_name = VALUES(last_name),
full_name = VALUES(full_name),
phone_number = VALUES(phone_number),
role = VALUES(role);

-- Insert Employee Profiles
INSERT INTO employee_profiles (employee_profile_id, user_id, designation, department, date_of_joining, reporting_manager, current_project, current_team, skills, last_appraisal_rating, current_goals) VALUES
(1, 1, 'Software Engineer', 'IT', '2023-01-15', 'Manager A', 'Project Alpha', 'Team Alpha', 'Java, Spring Boot, Angular', 4.5, 'Complete Module X'),
(2, 2, 'Senior Developer', 'IT', '2022-11-20', 'Manager B', 'Project Beta', 'Team Beta', 'React, Node.js, MongoDB', 4.2, 'Lead Team Y'),
(3, 3, 'Full Stack Developer', 'IT', '2023-02-10', 'Manager A', 'Project Gamma', 'Team Alpha', 'Vue.js, Python, PostgreSQL', 4.0, 'Implement Feature Z'),
(4, 4, 'UI/UX Designer', 'Design', '2023-03-05', 'Manager C', 'Project Delta', 'Team Design', 'Figma, Adobe XD, CSS', 4.3, 'Design System Update'),
(5, 5, 'QA Engineer', 'Quality', '2023-01-20', 'Manager D', 'Project Epsilon', 'Team QA', 'Selenium, Jest, Manual Testing', 4.1, 'Automation Framework'),
(6, 6, 'DevOps Engineer', 'Operations', '2022-12-15', 'Manager E', 'Project Zeta', 'Team DevOps', 'Docker, Kubernetes, AWS', 4.4, 'CI/CD Pipeline'),
(7, 7, 'Data Analyst', 'Analytics', '2023-02-28', 'Manager F', 'Project Eta', 'Team Analytics', 'Python, SQL, Tableau', 4.2, 'Data Dashboard'),
(8, 8, 'Product Manager', 'Product', '2022-10-10', 'Manager G', 'Project Theta', 'Team Product', 'Agile, Scrum, Product Strategy', 4.6, 'Product Roadmap'),
(9, 9, 'Backend Developer', 'IT', '2023-01-08', 'Manager A', 'Project Iota', 'Team Alpha', 'Java, Microservices, Redis', 4.3, 'API Development'),
(10, 10, 'Frontend Developer', 'IT', '2023-03-12', 'Manager B', 'Project Kappa', 'Team Beta', 'React, TypeScript, Redux', 4.1, 'Component Library'),
(11, 11, 'Mobile Developer', 'Mobile', '2023-02-15', 'Manager H', 'Project Lambda', 'Team Mobile', 'React Native, Flutter, iOS', 4.0, 'Mobile App'),
(12, 12, 'Security Engineer', 'Security', '2022-11-30', 'Manager I', 'Project Mu', 'Team Security', 'Penetration Testing, OWASP', 4.5, 'Security Audit'),
(13, 13, 'Technical Writer', 'Documentation', '2023-01-25', 'Manager J', 'Project Nu', 'Team Docs', 'Technical Writing, Markdown', 4.2, 'API Documentation')
ON DUPLICATE KEY UPDATE 
designation = VALUES(designation),
department = VALUES(department),
date_of_joining = VALUES(date_of_joining),
reporting_manager = VALUES(reporting_manager),
current_project = VALUES(current_project),
current_team = VALUES(current_team),
skills = VALUES(skills),
last_appraisal_rating = VALUES(last_appraisal_rating),
current_goals = VALUES(current_goals);

-- Insert Goals
INSERT INTO goals (goal_id, employee_id, title, description, start_date, end_date, status, priority, progress_percentage) VALUES
(1, 1, 'Complete Module X Development', 'Develop and test Module X for Project Alpha', '2024-01-01', '2024-03-31', 'In Progress', 'High', 65),
(2, 1, 'Code Review Process', 'Implement automated code review process', '2024-02-01', '2024-04-30', 'Pending', 'Medium', 0),
(3, 2, 'Lead Team Y', 'Take leadership role for Team Y development', '2024-01-15', '2024-06-30', 'In Progress', 'High', 40),
(4, 2, 'Performance Optimization', 'Optimize application performance by 30%', '2024-02-15', '2024-05-15', 'Pending', 'Medium', 0),
(5, 3, 'Implement Feature Z', 'Design and implement new feature Z', '2024-01-20', '2024-04-20', 'In Progress', 'High', 55),
(6, 3, 'Database Migration', 'Migrate legacy database to new system', '2024-03-01', '2024-06-01', 'Pending', 'Low', 0),
(7, 4, 'Design System Update', 'Update company design system', '2024-01-10', '2024-03-10', 'Completed', 'High', 100),
(8, 4, 'User Research', 'Conduct user research for new features', '2024-02-01', '2024-04-01', 'In Progress', 'Medium', 30),
(9, 5, 'Automation Framework', 'Build comprehensive test automation framework', '2024-01-05', '2024-05-05', 'In Progress', 'High', 70),
(10, 5, 'Test Coverage', 'Achieve 90% test coverage', '2024-02-01', '2024-06-01', 'Pending', 'Medium', 0),
(11, 6, 'CI/CD Pipeline', 'Implement complete CI/CD pipeline', '2024-01-01', '2024-04-01', 'In Progress', 'High', 80),
(12, 6, 'Infrastructure Monitoring', 'Set up comprehensive monitoring', '2024-02-01', '2024-05-01', 'Pending', 'Medium', 0),
(13, 7, 'Data Dashboard', 'Create executive data dashboard', '2024-01-15', '2024-03-15', 'Completed', 'High', 100),
(14, 7, 'Predictive Analytics', 'Implement predictive analytics model', '2024-02-15', '2024-06-15', 'In Progress', 'Medium', 25),
(15, 8, 'Product Roadmap', 'Create comprehensive product roadmap', '2024-01-01', '2024-03-31', 'In Progress', 'High', 60),
(16, 8, 'Market Research', 'Conduct market research for new features', '2024-02-01', '2024-04-30', 'Pending', 'Medium', 0),
(17, 9, 'API Development', 'Develop RESTful APIs for new features', '2024-01-10', '2024-04-10', 'In Progress', 'High', 45),
(18, 9, 'Microservices Architecture', 'Implement microservices architecture', '2024-02-10', '2024-06-10', 'Pending', 'High', 0),
(19, 10, 'Component Library', 'Build reusable component library', '2024-01-20', '2024-04-20', 'In Progress', 'Medium', 35),
(20, 10, 'Performance Optimization', 'Optimize frontend performance', '2024-02-20', '2024-05-20', 'Pending', 'Medium', 0),
(21, 11, 'Mobile App', 'Develop cross-platform mobile app', '2024-01-05', '2024-06-05', 'In Progress', 'High', 50),
(22, 11, 'App Store Optimization', 'Optimize app for app stores', '2024-03-01', '2024-05-01', 'Pending', 'Low', 0),
(23, 12, 'Security Audit', 'Conduct comprehensive security audit', '2024-01-01', '2024-03-31', 'In Progress', 'High', 75),
(24, 12, 'Security Training', 'Conduct security training for team', '2024-02-01', '2024-04-30', 'Pending', 'Medium', 0),
(25, 13, 'API Documentation', 'Create comprehensive API documentation', '2024-01-15', '2024-04-15', 'In Progress', 'Medium', 40),
(26, 13, 'User Guides', 'Create user guides for new features', '2024-02-15', '2024-05-15', 'Pending', 'Low', 0)
ON DUPLICATE KEY UPDATE 
title = VALUES(title),
description = VALUES(description),
start_date = VALUES(start_date),
end_date = VALUES(end_date),
status = VALUES(status),
priority = VALUES(priority),
progress_percentage = VALUES(progress_percentage);

-- Insert Feedback
INSERT INTO feedbacks (feedback_id, employee_id, reviewer_id, feedback_type, comments, rating, achievements, challenges, improvements, created_date) VALUES
(1, 1, 3, 'Manager Feedback', 'Excellent work on Module X development. Shows great technical skills and attention to detail.', 5, 'Completed ahead of schedule', 'Complex requirements', 'Continue learning new technologies'),
(2, 2, 1, 'Manager Feedback', 'Good leadership skills demonstrated. Team Y is performing well under your guidance.', 4, 'Team productivity increased', 'Communication could be better', 'Focus on team communication'),
(3, 3, 2, 'Manager Feedback', 'Feature Z implementation is progressing well. Good problem-solving approach.', 4, 'Creative solutions', 'Time management', 'Better time planning'),
(4, 4, 5, 'Manager Feedback', 'Design system update was completed successfully. Great attention to user experience.', 5, 'Improved user experience', 'Meeting deadlines', 'Better project planning'),
(5, 5, 6, 'Manager Feedback', 'Automation framework is taking shape nicely. Good technical approach.', 4, 'Reduced manual testing', 'Documentation', 'Improve documentation'),
(6, 6, 7, 'Manager Feedback', 'CI/CD pipeline implementation is excellent. Great DevOps practices.', 5, 'Improved deployment process', 'Complex configurations', 'Simplify configurations'),
(7, 7, 8, 'Manager Feedback', 'Data dashboard looks great. Good analytical skills demonstrated.', 4, 'Clear data visualization', 'Data accuracy', 'Focus on data validation'),
(8, 8, 9, 'Manager Feedback', 'Product roadmap is comprehensive. Good strategic thinking.', 4, 'Clear product vision', 'Stakeholder alignment', 'Better stakeholder communication'),
(9, 9, 10, 'Manager Feedback', 'API development is progressing well. Good coding standards.', 4, 'Clean code', 'Performance optimization', 'Focus on performance'),
(10, 10, 11, 'Manager Feedback', 'Component library is useful. Good reusability approach.', 4, 'Reusable components', 'Documentation', 'Improve component documentation'),
(11, 11, 12, 'Manager Feedback', 'Mobile app development is on track. Good cross-platform skills.', 4, 'Cross-platform compatibility', 'Performance', 'Optimize app performance'),
(12, 12, 13, 'Manager Feedback', 'Security audit findings are comprehensive. Good security awareness.', 5, 'Thorough security analysis', 'Implementation timeline', 'Faster implementation'),
(13, 13, 1, 'Manager Feedback', 'API documentation is clear and helpful. Good technical writing skills.', 4, 'Clear documentation', 'Coverage', 'Expand documentation coverage')
ON DUPLICATE KEY UPDATE 
feedback_type = VALUES(feedback_type),
comments = VALUES(comments),
rating = VALUES(rating),
achievements = VALUES(achievements),
challenges = VALUES(challenges),
improvements = VALUES(improvements),
created_date = VALUES(created_date);

-- Insert Review Cycles
INSERT INTO review_cycles (cycle_id, cycle_name, start_date, end_date, status, description) VALUES
(1, 'Q1 2024 Review', '2024-01-01', '2024-03-31', 'Completed', 'First quarter performance review'),
(2, 'Q2 2024 Review', '2024-04-01', '2024-06-30', 'In Progress', 'Second quarter performance review'),
(3, 'Q3 2024 Review', '2024-07-01', '2024-09-30', 'Pending', 'Third quarter performance review'),
(4, 'Q4 2024 Review', '2024-10-01', '2024-12-31', 'Pending', 'Fourth quarter performance review'),
(5, 'Annual 2024 Review', '2024-01-01', '2024-12-31', 'In Progress', 'Annual performance review')
ON DUPLICATE KEY UPDATE 
cycle_name = VALUES(cycle_name),
start_date = VALUES(start_date),
end_date = VALUES(end_date),
status = VALUES(status),
description = VALUES(description);

-- Insert Appraisals
INSERT INTO appraisals (appraisal_id, employee_id, cycle_id, manager_id, overall_rating, technical_skills, communication, teamwork, leadership, final_comments, status, appraisal_date) VALUES
(1, 1, 1, 3, 4.5, 5, 4, 4, 3, 'Excellent technical skills and good team player. Shows potential for leadership roles.', 'Completed', '2024-03-31'),
(2, 2, 1, 1, 4.2, 4, 4, 5, 4, 'Good technical skills and excellent leadership qualities. Great team player.', 'Completed', '2024-03-31'),
(3, 3, 1, 2, 4.0, 4, 3, 4, 3, 'Solid technical skills. Needs improvement in communication.', 'Completed', '2024-03-31'),
(4, 4, 1, 5, 4.3, 3, 5, 4, 3, 'Excellent design skills and communication. Good team collaboration.', 'Completed', '2024-03-31'),
(5, 5, 1, 6, 4.1, 4, 3, 4, 3, 'Good testing skills. Needs improvement in communication.', 'Completed', '2024-03-31'),
(6, 6, 1, 7, 4.4, 5, 4, 4, 4, 'Excellent DevOps skills and good leadership potential.', 'Completed', '2024-03-31'),
(7, 7, 1, 8, 4.2, 4, 4, 4, 3, 'Good analytical skills and team collaboration.', 'Completed', '2024-03-31'),
(8, 8, 1, 9, 4.6, 3, 5, 5, 5, 'Excellent product management skills and leadership.', 'Completed', '2024-03-31'),
(9, 9, 1, 10, 4.3, 5, 3, 4, 3, 'Excellent technical skills. Needs improvement in communication.', 'Completed', '2024-03-31'),
(10, 10, 1, 11, 4.1, 4, 4, 4, 3, 'Good frontend skills and team collaboration.', 'Completed', '2024-03-31'),
(11, 11, 1, 12, 4.0, 4, 3, 4, 3, 'Good mobile development skills. Needs improvement in communication.', 'Completed', '2024-03-31'),
(12, 12, 1, 13, 4.5, 5, 4, 4, 4, 'Excellent security skills and good team collaboration.', 'Completed', '2024-03-31'),
(13, 13, 1, 1, 4.2, 3, 5, 4, 3, 'Excellent communication skills and good technical writing.', 'Completed', '2024-03-31')
ON DUPLICATE KEY UPDATE 
overall_rating = VALUES(overall_rating),
technical_skills = VALUES(technical_skills),
communication = VALUES(communication),
teamwork = VALUES(teamwork),
leadership = VALUES(leadership),
final_comments = VALUES(final_comments),
status = VALUES(status),
appraisal_date = VALUES(appraisal_date);
