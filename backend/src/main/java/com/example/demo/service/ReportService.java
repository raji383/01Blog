package com.example.demo.service;

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
        System.out.println(1);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        
        User reporter = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (reporter.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned users cannot report others");
        }
        
        User reported = userRepository.findById(reportedUserId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported user not found"));
        
        System.out.println(2);
       
        Report report = new Report();
        report.setReporter(reporter);
        report.setReported(reported);
        report.setType("user");
        report.setReason(reason);
        report.setCreatedAt(java.time.Instant.now());
        reportRepository.save(report);
    }

    public void reportPost(Long reportedPostId, String reason) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (reporter.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Banned users cannot report others");
        }
        Post post = postRepository.findById(reportedPostId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported post not found"));
        if (post.getAuthor().isBanned()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot report a post by a banned user");
        }
        Report report = new Report();
        report.setReporter(reporter);
        report.setReported(post.getAuthor());
        report.setType("post");
        report.setReason(reason);
        reportRepository.save(report);

    }

    private User requireAdmin() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

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
        response.setReporterId(report.getReporter().getId());
        response.setReporterUsername(report.getReporter().getUsername());
        response.setReporterEmail(report.getReporter().getEmail());
        response.setReportedId(report.getReported().getId());
        response.setReportedUsername(report.getReported().getUsername());
        response.setReportedEmail(report.getReported().getEmail());
        return response;
    }
}
