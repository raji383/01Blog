package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
    @NotBlank @Size(max = 500) String title,
    @Size(max = 5000) String content,
    String mediaUrl
) {}