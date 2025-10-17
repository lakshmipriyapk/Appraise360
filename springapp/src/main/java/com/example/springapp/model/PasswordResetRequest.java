package com.example.springapp.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request model for password reset")
public class PasswordResetRequest {
    
    @Schema(description = "User's email address", example = "user@example.com")
    private String email;
    
    @Schema(description = "New password", example = "newPassword123")
    private String newPassword;
    
    // Default constructor
    public PasswordResetRequest() {}
    
    // Constructor with parameters
    public PasswordResetRequest(String email, String newPassword) {
        this.email = email;
        this.newPassword = newPassword;
    }
    
    // Getters and setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    @Override
    public String toString() {
        return "PasswordResetRequest{" +
                "email='" + email + '\'' +
                ", newPassword='[PROTECTED]'" +
                '}';
    }
}
