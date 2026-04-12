package com.example.demo.service;

import com.example.demo.model.Subscription;
import com.example.demo.model.User;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public boolean toggleSubscription(User subscriber, Long subscribedToId) {
        User subscribedTo = userRepository.findById(subscribedToId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var existingSub = subscriptionRepository.findBySubscriberAndSubscribedTo(subscriber, subscribedTo);
        if (existingSub.isPresent()) {
            subscriptionRepository.delete(existingSub.get());
            return false; // unsubscribed
        } else {
            Subscription sub = new Subscription();
            sub.setSubscriber(subscriber);
            sub.setSubscribedTo(subscribedTo);
            subscriptionRepository.save(sub);
            return true; // subscribed
        }
    }

    public boolean isSubscribed(User subscriber, Long subscribedToId) {
        User subscribedTo = userRepository.findById(subscribedToId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return subscriptionRepository.findBySubscriberAndSubscribedTo(subscriber, subscribedTo).isPresent();
    }

    public List<User> getSubscribedUsers(User subscriber) {
        List<Subscription> subs = subscriptionRepository.findBySubscriber(subscriber);
        return subs.stream().map(Subscription::getSubscribedTo).collect(Collectors.toList());
    }

    public long getSubscriberCount(User user) {
        return subscriptionRepository.findBySubscribedTo(user).size();
    }
}