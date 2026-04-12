package com.example.demo.repository;

import com.example.demo.model.Subscription;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    List<Subscription> findBySubscriber(User subscriber);
    List<Subscription> findBySubscribedTo(User subscribedTo);
    void deleteBySubscriber(User subscriber);
    void deleteBySubscribedTo(User subscribedTo);
}