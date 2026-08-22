package com.libassist.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EbookRentRequest {

    @NotNull(message = "Ebook is required")
    private Long ebookId;

    @NotNull(message = "Number of months is required")
    @Positive(message = "Number of months must be positive")
    @Max(value = 12, message = "An ebook can be rented for at most 12 months")
    private Integer months;
}
