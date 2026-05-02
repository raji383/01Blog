package com.example.demo.dto;

import java.util.List;

public record ApiErrorResponse(String message, List<String> errors) {
}
