package com.example.demo.dto;

import lombok.Data;

@Data
public class MediaUploadResponse {
    private String mediaUrl;
    private String mediaType;
    private String originalFilename;
}
