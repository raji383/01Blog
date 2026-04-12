package com.example.demo.controller;

import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.service.SubscriptionService;
import com.example.demo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final SubscriptionService subscriptionService;

    public UserController(UserService userService, SubscriptionService subscriptionService) {
        this.userService = userService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/profile/{username}")
    public UserResponse getProfile(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.fromUser(user);
    }

    @PostMapping("/subscribe/{userId}")
    public Map<String, Object> toggleSubscription(@AuthenticationPrincipal User subscriber, @PathVariable Long userId) {
        boolean subscribed = subscriptionService.toggleSubscription(subscriber, userId);
        User subscribedTo = userService.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        long count = subscriptionService.getSubscriberCount(subscribedTo);
        return Map.of("subscribed", subscribed, "subscriberCount", count);
    }

    @GetMapping("/subscriptions")
    public List<UserResponse> getSubscriptions(@AuthenticationPrincipal User user) {
        List<User> subscribedUsers = subscriptionService.getSubscribedUsers(user);
        return subscribedUsers.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    // Admin endpoints
    @GetMapping("/admin")
    public List<UserResponse> getAllUsers(@AuthenticationPrincipal User user) {
        List<User> users = userService.findAll();
        return users.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/admin/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@AuthenticationPrincipal User admin, @PathVariable Long userId) {
        userService.deleteUser(userId);
    }
}