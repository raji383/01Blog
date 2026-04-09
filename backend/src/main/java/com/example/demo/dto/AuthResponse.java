package com.example.demo.dto;

import com.example.demo.model.Role;
import com.example.demo.model.User;

public record AuthResponse(
        Long id,
        String username,
        String email,
        Role role,
        String token
) {
    public static AuthResponse fromUser(User user, String token) {
        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), token);
    }
}
