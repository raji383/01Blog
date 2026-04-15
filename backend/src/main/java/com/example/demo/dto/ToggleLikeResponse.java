package com.example.demo.dto;

import lombok.Data;

@Data
public class ToggleLikeResponse {
    private Long postId;
    private Long userId;
    private String username;
    private boolean liked;
    private long likeCount;
}
