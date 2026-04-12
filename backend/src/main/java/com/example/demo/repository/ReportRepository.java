package com.example.demo.repository;

import com.example.demo.model.Report;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportedUser(User reportedUser);
    void deleteByReporter(User reporter);
    void deleteByReportedUser(User reportedUser);
}