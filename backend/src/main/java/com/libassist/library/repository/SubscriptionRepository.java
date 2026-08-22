package com.libassist.library.repository;

import com.libassist.library.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    /** The patron's live subscription, if any: still marked active and not yet past its end date. */
    Optional<Subscription> findFirstByUserIdAndStatusAndEndDateAfterOrderByEndDateDesc(
            Long userId, String status, LocalDateTime now);

    List<Subscription> findByUserIdOrderByIdDesc(Long userId);
}
