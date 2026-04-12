package com.example.demo.service;

import com.example.demo.dto.PostRequest;
import com.example.demo.dto.PostResponse;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final SubscriptionService subscriptionService;

    public PostService(PostRepository postRepository, CommentRepository commentRepository, LikeRepository likeRepository, SubscriptionService subscriptionService) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional
    public PostResponse createPost(User user, PostRequest request) {
        Post post = new Post();
        post.setUser(user);
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setMediaUrl(request.mediaUrl());
        Post savedPost = postRepository.save(post);
        return PostResponse.fromPost(savedPost, 0, 0);
    }

    public List<PostResponse> getPostsByUser(User user) {
        List<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(user);
        return posts.stream()
                .map(post -> PostResponse.fromPost(
                    post,
                    likeRepository.countByPost(post),
                    commentRepository.findByPostOrderByCreatedAtAsc(post).size()
                ))
                .collect(Collectors.toList());
    }

    public List<PostResponse> getFeedPosts(User user) {
        List<User> subscribedUsers = subscriptionService.getSubscribedUsers(user);
        if (subscribedUsers.isEmpty()) {
            return List.of();
        }
        List<Post> posts = postRepository.findByUserInOrderByCreatedAtDesc(subscribedUsers);
        return posts.stream()
                .map(post -> PostResponse.fromPost(
                    post,
                    likeRepository.countByPost(post),
                    commentRepository.findByPostOrderByCreatedAtAsc(post).size()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public PostResponse updatePost(Long postId, User user, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setMediaUrl(request.mediaUrl());
        Post savedPost = postRepository.save(post);
        return PostResponse.fromPost(savedPost,
            likeRepository.countByPost(savedPost),
            commentRepository.findByPostOrderByCreatedAtAsc(savedPost).size());
    }

    @Transactional
    public void deletePost(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        postRepository.delete(post);
    }

    public Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> PostResponse.fromPost(
                    post,
                    likeRepository.countByPost(post),
                    commentRepository.findByPostOrderByCreatedAtAsc(post).size()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePostByAdmin(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        postRepository.delete(post);
    }
}