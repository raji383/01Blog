package com.example.demo.service;

import com.example.demo.dto.ReportRequest;
import com.example.demo.model.Report;
import com.example.demo.model.User;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createReport(User reporter, ReportRequest request) {
        if (reporter.getId().equals(request.reportedUserId())) {
            throw new RuntimeException("Cannot report yourself");
        }
        User reportedUser = userRepository.findById(request.reportedUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setReason(request.reason());
        reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByUser(User user) {
        return reportRepository.findByReportedUser(user);
    }
}