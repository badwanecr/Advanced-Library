package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionDto {
    private Long id;
    private String plan;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double amount;
    private Double creditApplied;
    private String status;
}
