package com.example.demo.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CommentRequest;
import com.example.demo.dto.CommentResponse;
import com.example.demo.dto.MediaUploadResponse;
import com.example.demo.dto.PostRequest;
import com.example.demo.dto.PostResponse;
import com.example.demo.dto.ToggleLikeRequest;
import com.example.demo.dto.ToggleLikeResponse;
import com.example.demo.entities.Comment;
import com.example.demo.entities.Post;
import com.example.demo.entities.PostLike;
import com.example.demo.entities.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final MediaStorageService mediaStorageService;

    public PostService(
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            MediaStorageService mediaStorageService) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.mediaStorageService = mediaStorageService;
    }

    public PostResponse create(PostRequest request) {
        System.out.println("Creating post for user: " + request.getAuthorUsername());
        User author = getUser(request.getAuthorUsername());

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
            MediaUploadResponse mediaUrl = mediaStorageService.store(request.getMediaFile());
            System.out.println("Stored media for post: " + mediaUrl.getMediaUrl());
            post.setMediaUrl(mediaUrl.getMediaUrl());
            
        }
        post.setAuthor(author);

        return toResponse(postRepository.save(post));
    }

    public List<PostResponse> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PostResponse> getPostsByUsername(String username) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PostResponse update(Long postId, PostRequest request) {
        Post post = getPost(postId);
        User author = getUser(request.getAuthorUsername());

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setMediaUrl(request.getMediaUrl());
        post.setAuthor(author);

        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long postId) {
        Post post = getPost(postId);
        commentRepository.deleteByPostId(postId);
        postLikeRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    public ToggleLikeResponse toggleLike(Long postId, ToggleLikeRequest request) {
        Post post = getPost(postId);
        User user = getUser(request.getUsername());

        boolean liked;
        PostLike existingLike = postLikeRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);
        if (existingLike != null) {
            postLikeRepository.delete(existingLike);
            liked = false;
        } else {
            PostLike postLike = new PostLike();
            postLike.setPost(post);
            postLike.setUser(user);
            postLikeRepository.save(postLike);
            liked = true;
        }

        ToggleLikeResponse response = new ToggleLikeResponse();
        response.setPostId(postId);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setLiked(liked);
        response.setLikeCount(postLikeRepository.countByPostId(postId));
        return response;
    }

    public List<CommentResponse> getComments(Long postId) {
        getPost(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    public CommentResponse addComment(Long postId, CommentRequest request) {
        Post post = getPost(postId);
        User author = getUser(request.getAuthorUsername());

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        return toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        commentRepository.delete(comment);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private PostResponse toResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setMediaUrl(post.getMediaUrl());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorUsername(post.getAuthor().getUsername());
        response.setLikeCount(postLikeRepository.countByPostId(post.getId()));
        response.setCommentCount(commentRepository.countByPostId(post.getId()));
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        return response;
    }

    private CommentResponse toCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPost().getId());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorUsername(comment.getAuthor().getUsername());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }
}
