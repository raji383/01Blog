package com.example.demo.controler;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.CommentRequest;
import com.example.demo.dto.CommentResponse;
import com.example.demo.dto.MediaUploadResponse;
import com.example.demo.dto.PostRequest;
import com.example.demo.dto.PostResponse;
import com.example.demo.dto.ToggleLikeRequest;
import com.example.demo.dto.ToggleLikeResponse;
import com.example.demo.service.MediaStorageService;
import com.example.demo.service.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final MediaStorageService mediaStorageService;

    public PostController(PostService postService, MediaStorageService mediaStorageService) {
        this.postService = postService;
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.create(request));
    }

    @PostMapping("/upload")
    public ResponseEntity<MediaUploadResponse> uploadMedia(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mediaStorageService.store(file));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        return ResponseEntity.ok(postService.getFeed());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String username) {
        return ResponseEntity.ok(postService.getPostsByUsername(username));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long postId, @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.delete(postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<ToggleLikeResponse> toggleLike(@PathVariable Long postId, @Valid @RequestBody ToggleLikeRequest request) {
        return ResponseEntity.ok(postService.toggleLike(postId, request));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getComments(postId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(postService.addComment(postId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        postService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    public ResponseEntity<List<PostResponse>> getAllPostsForAdmin() {
        return ResponseEntity.ok(postService.getFeed());
    }

    @DeleteMapping("/admin/{postId}")
    public ResponseEntity<Void> deletePostAsAdmin(@PathVariable Long postId) {
        postService.delete(postId);
        return ResponseEntity.noContent().build();
    }
}
