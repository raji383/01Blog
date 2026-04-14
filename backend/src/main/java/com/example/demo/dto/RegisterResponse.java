package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterResponse {
    private Long id;
    private String username;
    private String jwt;
}
