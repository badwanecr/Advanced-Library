package com.libassist.library.repository;

import com.libassist.library.entity.EbookRental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EbookRentalRepository extends JpaRepository<EbookRental, Long> {

    Optional<EbookRental> findFirstByUserIdAndEbookIdAndEndDateAfterOrderByEndDateDesc(
            Long userId, Long ebookId, LocalDateTime now);

    List<EbookRental> findByUserIdAndEndDateAfter(Long userId, LocalDateTime now);
}
