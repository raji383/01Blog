package com.example.demo.dto;

import java.time.Instant;

import lombok.Data;

@Data
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorUsername;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
}
