package com.libassist.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Payload for issuing a new book to a patron. */
@Data
public class IssueRequest {

    @NotNull(message = "Book id is required")
    private Long bookId;

    @NotNull(message = "Patron id is required")
    private Long userId;

    @NotNull(message = "Return date (due date) is required")
    private LocalDate returnDate;
}
