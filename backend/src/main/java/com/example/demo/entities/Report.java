package com.example.demo.entities;

import java.time.Instant;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "reported_id", nullable = false)
    private User reported;

    @ManyToOne
    @JoinColumn(name = "reported_post_id")
    private Post reportedPost;

    @Column(nullable = false)
    private String type; // "user" or "post"

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private Instant createdAt;


}
