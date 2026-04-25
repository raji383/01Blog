package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);
    void deleteBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
