package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportRequest(
    @NotBlank Long reportedUserId,
    @NotBlank @Size(max = 1000) String reason
) {}