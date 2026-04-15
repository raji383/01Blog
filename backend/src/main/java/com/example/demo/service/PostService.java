package com.example.demo.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.PostRequest;
import com.example.demo.dto.PostResponse;
import com.example.demo.dto.ToggleLikeRequest;
import com.example.demo.dto.ToggleLikeResponse;
import com.example.demo.entities.Post;
import com.example.demo.entities.PostLike;
import com.example.demo.entities.User;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, PostLikeRepository postLikeRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.userRepository = userRepository;
    }

    public PostResponse create(PostRequest request) {
        User author = getAuthor(request.getAuthorUsername());

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setMediaUrl(request.getMediaUrl());
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
        User author = getAuthor(request.getAuthorUsername());

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setMediaUrl(request.getMediaUrl());
        post.setAuthor(author);

        return toResponse(postRepository.save(post));
    }

    public void delete(Long postId) {
        Post post = getPost(postId);
        postRepository.delete(post);
    }

    public ToggleLikeResponse toggleLike(Long postId, ToggleLikeRequest request) {
        Post post = getPost(postId);
        User user = getAuthor(request.getUsername());

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

    private User getAuthor(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));
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
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        return response;
    }
}
