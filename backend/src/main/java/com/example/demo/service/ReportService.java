package com.example.demo.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.ReportAdminResponse;
import com.example.demo.entities.Post;
import com.example.demo.entities.Report;
import com.example.demo.entities.Role;
import com.example.demo.entities.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository,
            PostRepository postRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public List<ReportAdminResponse> getAllReportsForAdmin() {
        requireAdmin();
        return reportRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    public void deleteReportAsAdmin(Long reportId) {
        requireAdmin();
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        reportRepository.delete(report);
    }

    public void reportUser(Long reportedUserId, String reason) {
        User reporter = getCurrentUser();
        if (reporter.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned users cannot report others");
        }

        User reported = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported user not found"));

        if (reporter.getId().equals(reported.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot report your own account");
        }

        reportRepository.save(buildReport(reporter, reported, null, "user", reason));
    }

    public void reportPost(Long reportedPostId, String reason) {
        User reporter = getCurrentUser();

        if (reporter.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned users cannot report others");
        }

        Post post = postRepository.findById(reportedPostId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported post not found"));

        if (reporter.getId().equals(post.getAuthor().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot report your own post");
        }

        reportRepository.save(buildReport(reporter, post.getAuthor(), post, "post", reason));
    }

    private Report buildReport(User reporter, User reported, Post reportedPost, String type, String reason) {
        String normalizedReason = normalizeReason(reason);
        Report report = new Report();
        report.setReporter(reporter);
        report.setReported(reported);
        report.setReportedPost(reportedPost);
        report.setType(type);
        report.setReason(normalizedReason);
        report.setCreatedAt(Instant.now());
        return report;
    }

    private String normalizeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report reason is required");
        }

        return reason.trim();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User requireAdmin() {
        User user = getCurrentUser();

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        if (user.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned admin cannot perform this action");
        }

        return user;
    }

    private ReportAdminResponse toAdminResponse(Report report) {
        ReportAdminResponse response = new ReportAdminResponse();
        response.setId(report.getId());
        response.setType(report.getType());
        response.setReason(report.getReason());
        response.setCreatedAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null);
        response.setReporterId(report.getReporter().getId());
        response.setReporterUsername(report.getReporter().getUsername());
        response.setReporterEmail(report.getReporter().getEmail());
        response.setReportedId(report.getReported().getId());
        response.setReportedUsername(report.getReported().getUsername());
        response.setReportedEmail(report.getReported().getEmail());
        if (report.getReportedPost() != null) {
            response.setReportedPostId(report.getReportedPost().getId());
            response.setReportedPostTitle(report.getReportedPost().getTitle());
            response.setReportedPostContent(report.getReportedPost().getContent());
            response.setReportedPostMediaUrl(report.getReportedPost().getMediaUrl());
        }
        return response;
    }
}
