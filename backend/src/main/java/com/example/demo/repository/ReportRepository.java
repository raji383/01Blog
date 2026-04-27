package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByIdDesc();
    void deleteByReporterIdOrReportedId(Long reporterId, Long reportedId);
}
