package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.Subscription;
import com.example.demo.entities.User;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);

    @Query("select s.following.id from Subscription s where s.follower.id = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);

    @Query("select s.follower from Subscription s where s.following.id = :followingId")
    List<User> findFollowersByFollowingId(@Param("followingId") Long followingId);
}
