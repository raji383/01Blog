package com.example.demo.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.BanUserRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.RegisterResponse;
import com.example.demo.dto.UserAdminResponse;
import com.example.demo.dto.UserProfileResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.demo.entities.Post;
import com.example.demo.entities.Role;
import com.example.demo.entities.Subscription;
import com.example.demo.entities.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final ReportRepository reportRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            CommentRepository commentRepository,
            SubscriptionRepository subscriptionRepository,
            NotificationRepository notificationRepository,
            ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.reportRepository = reportRepository;
    }

    public RegisterResponse register(RegisterRequest request) {
        String normalizedUsername = request.getUsername().trim();
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(normalizedUsername).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(com.example.demo.entities.Role.USER);
        user.setBanned(false);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved);

        RegisterResponse res = new RegisterResponse();
        res.setId(saved.getId());
        res.setUsername(saved.getUsername());
        res.setJwt(token);
        return res;
    }

    public RegisterResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (user.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is banned");
        }

        String token = jwtUtil.generateToken(user);

        RegisterResponse res = new RegisterResponse();
        res.setId(user.getId());
        res.setUsername(user.getUsername());
        res.setJwt(token);
        return res;
    }

    public UserProfileResponse getProfile() {
        return toProfileResponse(getCurrentUser());
    }

    public UserProfileResponse getUser(Long userId) {
        return toProfileResponse(getUserEntity(userId));
    }

    @Transactional
    public void subscribeToUser(Long targetUserId) {
        User follower = getCurrentUser();
        User targetUser = getUserEntity(targetUserId);

        if (follower.getId().equals(targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User cannot subscribe to themselves");
        }

        if (subscriptionRepository.existsByFollowerIdAndFollowingId(follower.getId(), targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already subscribed to this user");
        }

        Subscription subscription = new Subscription();
        subscription.setFollower(follower);
        subscription.setFollowing(targetUser);
        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribeFromUser(Long targetUserId) {
        User follower = getCurrentUser();
        User targetUser = getUserEntity(targetUserId);

        if (follower.getId().equals(targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User cannot unsubscribe from themselves");
        }

        if (!subscriptionRepository.existsByFollowerIdAndFollowingId(follower.getId(), targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found");
        }

        subscriptionRepository.deleteByFollowerIdAndFollowingId(follower.getId(), targetUser.getId());
    }

    public UserAdminResponse updateBanStatus(Long userId, BanUserRequest request) {
        User admin = requireAdmin();
        User targetUser = getUserEntity(userId);
        validateModerationTarget(admin, targetUser);

        targetUser.setBanned(request.getBanned());
        return toAdminResponse(userRepository.save(targetUser));
    }

    @Transactional
    public void deleteUserAsAdmin(Long userId) {
        User admin = requireAdmin();
        User targetUser = getUserEntity(userId);
        validateModerationTarget(admin, targetUser);

        List<Post> posts = postRepository.findByAuthorId(targetUser.getId());
        for (Post post : posts) {
            commentRepository.deleteByPostId(post.getId());
            postLikeRepository.deleteByPostId(post.getId());
            reportRepository.deleteByReportedPostId(post.getId());
            postRepository.delete(post);
        }

        commentRepository.deleteByAuthorId(targetUser.getId());
        postLikeRepository.deleteByUserId(targetUser.getId());
        notificationRepository.deleteBySenderIdOrReceiverId(targetUser.getId(), targetUser.getId());
        reportRepository.deleteByReporterIdOrReportedId(targetUser.getId(), targetUser.getId());
        userRepository.delete(targetUser);
    }

    public List<UserAdminResponse> getAllUsersForAdmin() {
        requireAdmin();
        return userRepository.findAllByOrderByUsernameAsc()
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    private User requireAdmin(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        if (admin.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned admin cannot perform this action");
        }

        return admin;
    }

    private User requireAdmin() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return requireAdmin(username);
    }

    public List<UserProfileResponse> getUsers() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        List<User> users = new ArrayList<>(userRepository.findAll());
        users.removeIf(user -> user.getUsername().equals(currentUsername));
        Collections.shuffle(users);

        return users.stream()
                .limit(10)
                .map(this::toProfileResponse)
                .toList();
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User getCurrentUserOrNull() {
        Object principal = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null) {
            return null;
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || "anonymousUser".equals(username)) {
            return null;
        }

        return userRepository.findByUsername(username).orElse(null);
    }

    private void validateModerationTarget(User admin, User targetUser) {
        if (admin.getId().equals(targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin cannot moderate their own account");
        }

        if (targetUser.getRole() == Role.ADMIN) {

            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot moderate another admin account");
        }
    }

    private UserAdminResponse toAdminResponse(User user) {
        UserAdminResponse response = new UserAdminResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setBanned(user.isBanned());
        return response;
    }

    private UserProfileResponse toProfileResponse(User user) {
        User currentUser = getCurrentUserOrNull();
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setBanned(user.isBanned());
        response.setNotificationCount(notificationRepository.countByReceiverIdAndIsReadFalse(user.getId()));
        response.setFollowerCount(subscriptionRepository.countByFollowingId(user.getId()));
        response.setFollowingCount(subscriptionRepository.countByFollowerId(user.getId()));
        response.setSubscribed(currentUser != null
                && !currentUser.getId().equals(user.getId())
                && subscriptionRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), user.getId()));
        return response;
    }
}
