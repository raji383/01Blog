package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.model.Report;
import com.example.demo.model.User;
import com.example.demo.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createReport(@AuthenticationPrincipal User user, @Valid @RequestBody ReportRequest request) {
        reportService.createReport(user, request);
    }

    @GetMapping("/admin")
    public List<Report> getAllReports(@AuthenticationPrincipal User user) {
        return reportService.getAllReports();
    }
}