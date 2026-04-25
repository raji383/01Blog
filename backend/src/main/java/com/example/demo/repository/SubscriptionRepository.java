package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
