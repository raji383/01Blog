package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.example.demo.entities.Notification;
import com.example.demo.entities.NotificationType;
import com.example.demo.entities.Post;
import com.example.demo.entities.PostLike;
import com.example.demo.entities.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final MediaStorageService mediaStorageService;
    private final ReportRepository reportRepository;

    public PostService(
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            SubscriptionRepository subscriptionRepository,
            NotificationRepository notificationRepository,
            MediaStorageService mediaStorageService,
            ReportRepository reportRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.mediaStorageService = mediaStorageService;
        this.reportRepository = reportRepository;
    }

    @Transactional
    public PostResponse create(PostRequest request) {
        User author = getCurrentUser();

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
            MediaUploadResponse mediaUrl = mediaStorageService.store(request.getMediaFile());
            post.setMediaUrl(mediaUrl.getMediaUrl());
            
        }
        post.setAuthor(author);

        Post savedPost = postRepository.save(post);
        createNewPostNotifications(author, savedPost);

        return toResponse(savedPost);
    }

    public List<PostResponse> getFeed() {
        User currentUser = getCurrentUser();
        List<Long> authorIds = new ArrayList<>(subscriptionRepository.findFollowingIdsByFollowerId(currentUser.getId()));
        if (!authorIds.contains(currentUser.getId())) {
            authorIds.add(currentUser.getId());
        }

        return postRepository.findByAuthorIdInAndHiddenFalseOrderByCreatedAtDesc(authorIds)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PostResponse> getAllPostsForAdmin() {
        requireAdmin();
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PostResponse> getPostsByUsername(String username) {
        return postRepository.findByAuthorUsernameAndHiddenFalseOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PostResponse updateVisibility(Long postId, boolean hidden) {
        requireAdmin();
        Post post = getPost(postId);
        post.setHidden(hidden);
        return toResponse(postRepository.save(post));
    }

    public PostResponse update(Long postId, PostRequest request) {
        Post post = getPost(postId);
        User author = getCurrentUser();
        User postAuthor = post.getAuthor();
        if (!postAuthor.getId().equals(author.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own posts");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
            MediaUploadResponse mediaUrl = mediaStorageService.store(request.getMediaFile());
            post.setMediaUrl(mediaUrl.getMediaUrl());
        } else {
            post.setMediaUrl(request.getMediaUrl());
        }
        post.setAuthor(author);

        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long postId) {
        Post post = getPost(postId);
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().name().equals("ADMIN");
        if (!post.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }

        commentRepository.deleteByPostId(postId);
        postLikeRepository.deleteByPostId(postId);
        reportRepository.deleteByReportedPostId(postId);
        postRepository.delete(post);
    }

    public ToggleLikeResponse toggleLike(Long postId, ToggleLikeRequest request) {
        Post post = getPost(postId);
        User user = getCurrentUser();

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
        User author = getCurrentUser();

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        return toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().name().equals("ADMIN");
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return getUser(username);
    }

    private User requireAdmin() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == null || !currentUser.getRole().name().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        if (currentUser.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned admin cannot perform this action");
        }

        return currentUser;
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private void createNewPostNotifications(User author, Post post) {
        List<User> followers = subscriptionRepository.findFollowersByFollowingId(author.getId());
        if (followers.isEmpty()) {
            return;
        }

        List<Notification> notifications = followers.stream()
                .map(follower -> {
                    Notification notification = new Notification();
                    notification.setSender(author);
                    notification.setReceiver(follower);
                    notification.setType(NotificationType.NEW_POST);
                    notification.setMessage(author.getUsername() + " published a new post: " + post.getTitle());
                    notification.setRead(false);
                    return notification;
                })
                .toList();

        notificationRepository.saveAll(notifications);
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
        response.setHidden(post.isHidden());
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
