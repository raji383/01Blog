package com.example.demo.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {

    @NotBlank
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @NotBlank
    @Size(max = 5000, message = "Content must be at most 5000 characters")
    private String content;

    @Size(max = 1000, message = "Media URL must be at most 1000 characters")
    private String mediaUrl;

    private MultipartFile mediaFile;
    
}
