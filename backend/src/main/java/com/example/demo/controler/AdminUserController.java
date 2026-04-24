package com.example.demo.controler;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AdminActionRequest;
import com.example.demo.dto.BanUserRequest;
import com.example.demo.dto.UserAdminResponse;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me() {
        return ResponseEntity.ok(userService.getProfile());
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }
    @GetMapping("/admin")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(@RequestParam String adminUsername) {
        return ResponseEntity.ok(userService.getAllUsersForAdmin(adminUsername));
    }

    @PutMapping("/admin/{userId}/ban")
    public ResponseEntity<UserAdminResponse> updateBanStatus(
            @PathVariable Long userId,
            @Valid @RequestBody BanUserRequest request) {
        return ResponseEntity.ok(userService.updateBanStatus(userId, request));
    }

    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminActionRequest request) {
        userService.deleteUserAsAdmin(userId, request.getAdminUsername());
        return ResponseEntity.noContent().build();
    }
}
