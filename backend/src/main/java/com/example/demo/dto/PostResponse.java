package com.example.demo.dto;

import com.example.demo.model.Post;
import java.time.LocalDateTime;

public record PostResponse(
    Long id,
    String username,
    String title,
    String content,
    String mediaUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    long likeCount,
    long commentCount
) {
    public static PostResponse fromPost(Post post, long likeCount, long commentCount) {
        return new PostResponse(
            post.getId(),
            post.getUser().getUsername(),
            post.getTitle(),
            post.getContent(),
            post.getMediaUrl(),
            post.getCreatedAt(),
            post.getUpdatedAt(),
            likeCount,
            commentCount
        );
    }
}