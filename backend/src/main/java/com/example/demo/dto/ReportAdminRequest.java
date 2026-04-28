package com.example.demo.dto;

import java.time.Instant;

import lombok.Data;

@Data
public class ReportAdminRequest {
    private String type;
    private String reason;
    private Instant createdAt;
}
