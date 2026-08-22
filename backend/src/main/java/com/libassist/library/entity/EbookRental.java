package com.libassist.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** Time-limited access to one ebook, bought by a patron who has no subscription. */
@Entity
@Table(name = "ebook_rentals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EbookRental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id", nullable = false)
    private Ebook ebook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Integer months;

    @Column(nullable = false)
    private Double amount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
