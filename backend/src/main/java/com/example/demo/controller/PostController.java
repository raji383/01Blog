package com.example.demo.controller;

import com.example.demo.dto.CommentRequest;
import com.example.demo.dto.CommentResponse;
import com.example.demo.dto.PostRequest;
import com.example.demo.dto.PostResponse;
import com.example.demo.model.User;
import com.example.demo.service.CommentService;
import com.example.demo.service.LikeService;
import com.example.demo.service.PostService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final CommentService commentService;
    private final LikeService likeService;
    private final UserService userService;

    public PostController(PostService postService, CommentService commentService, LikeService likeService, UserService userService) {
        this.postService = postService;
        this.commentService = commentService;
        this.likeService = likeService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(@AuthenticationPrincipal User user, @Valid @RequestBody PostRequest request) {
        return postService.createPost(user, request);
    }

    @GetMapping("/feed")
    public List<PostResponse> getFeed(@AuthenticationPrincipal User user) {
        return postService.getFeedPosts(user);
    }

    @GetMapping("/user/{username}")
    public List<PostResponse> getPostsByUser(@PathVariable String username, UserService userService) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return postService.getPostsByUser(user);
    }

    @PutMapping("/{postId}")
    public PostResponse updatePost(@AuthenticationPrincipal User user, @PathVariable Long postId, @Valid @RequestBody PostRequest request) {
        return postService.updatePost(postId, user, request);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@AuthenticationPrincipal User user, @PathVariable Long postId) {
        postService.deletePost(postId, user);
    }

    @PostMapping("/{postId}/like")
    public Map<String, Object> toggleLike(@AuthenticationPrincipal User user, @PathVariable Long postId) {
        boolean liked = likeService.toggleLike(user, postId);
        long count = likeService.getLikeCount(postId);
        return Map.of("liked", liked, "count", count);
    }

    @PostMapping("/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(@AuthenticationPrincipal User user, @PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return commentService.addComment(user, postId, request);
    }

    @GetMapping("/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long postId) {
        return commentService.getCommentsByPost(postId);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@AuthenticationPrincipal User user, @PathVariable Long commentId) {
        commentService.deleteComment(commentId, user);
    }

    // Admin endpoints
    @GetMapping("/admin")
    public List<PostResponse> getAllPosts(@AuthenticationPrincipal User admin) {
        return postService.getAllPosts();
    }

    @DeleteMapping("/admin/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePostByAdmin(@AuthenticationPrincipal User admin, @PathVariable Long postId) {
        postService.deletePostByAdmin(postId);
    }
}