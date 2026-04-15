package com.example.demo.dto;

import java.time.Instant;

import lombok.Data;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String mediaUrl;
    private Long authorId;
    private String authorUsername;
    private long likeCount;
    private Instant createdAt;
    private Instant updatedAt;
}
