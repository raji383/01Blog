package com.example.demo.dto;

import com.example.demo.model.Comment;
import java.time.LocalDateTime;

public record CommentResponse(
    Long id,
    String username,
    String content,
    LocalDateTime createdAt
) {
    public static CommentResponse fromComment(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getUser().getUsername(),
            comment.getContent(),
            comment.getCreatedAt()
        );
    }
}