package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminActionRequest {

    @NotBlank
    private String adminUsername;
}
