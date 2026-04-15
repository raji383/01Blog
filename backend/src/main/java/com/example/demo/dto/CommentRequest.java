package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank
    @Size(max = 2000, message = "Comment must be at most 2000 characters")
    private String content;

    @NotBlank
    private String authorUsername;
}
