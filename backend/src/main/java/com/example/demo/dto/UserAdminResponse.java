package com.example.demo.dto;

import com.example.demo.entities.Role;

import lombok.Data;

@Data
public class UserAdminResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean banned;
}
