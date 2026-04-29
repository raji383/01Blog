package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportAdminResponse {
    private Long id;
    private String type;
    private String reason;
    private String createdAt;
    private Long reporterId;
    private String reporterUsername;
    private String reporterEmail;
    private Long reportedId;
    private String reportedUsername;
    private String reportedEmail;
    private Long reportedPostId;
    private String reportedPostTitle;
    private String reportedPostContent;
    private String reportedPostMediaUrl;
}
