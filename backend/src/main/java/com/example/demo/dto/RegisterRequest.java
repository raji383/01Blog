package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters")
    private String username;

    @Email
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
