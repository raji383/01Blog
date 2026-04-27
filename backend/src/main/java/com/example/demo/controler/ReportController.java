package com.example.demo.controler;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ReportAdminResponse;
import com.example.demo.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ReportAdminResponse>> getAllReportsForAdmin() {
        return ResponseEntity.ok(reportService.getAllReportsForAdmin());
    }

    @DeleteMapping("/admin/{reportId}")
    public ResponseEntity<Void> deleteReportAsAdmin(@PathVariable Long reportId) {
        reportService.deleteReportAsAdmin(reportId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/user/{reportedUserId}")
    public ResponseEntity<Void> reportUser(@PathVariable Long reportedUserId) {

        reportService.reportUser(reportedUserId);
        return ResponseEntity.ok().build();
    }
}
