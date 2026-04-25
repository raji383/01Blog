package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entities.NotificationType;

import lombok.Data;

@Data
public class NotificationResponse {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private Long receiverId;
    private NotificationType type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
