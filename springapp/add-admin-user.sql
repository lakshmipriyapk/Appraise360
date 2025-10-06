-- Add admin user with the provided credentials
INSERT INTO users (user_id, username, email, password, first_name, last_name, full_name, phone_number, role) VALUES
(24, 'admin123', 'admin123@gmail.com', 'Admin@123', 'admin', 'admin', 'admin', '9999999999', 'Admin')
ON DUPLICATE KEY UPDATE 
username = VALUES(username),
email = VALUES(email),
password = VALUES(password),
first_name = VALUES(first_name),
last_name = VALUES(last_name),
full_name = VALUES(full_name),
phone_number = VALUES(phone_number),
role = VALUES(role);
