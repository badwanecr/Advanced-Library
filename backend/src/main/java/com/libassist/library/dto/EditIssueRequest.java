package com.libassist.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Used to renew/extend an existing (not yet returned) issue with a new due date. */
@Data
public class EditIssueRequest {

    @NotNull(message = "Issue id is required")
    private Long issueId;

    @NotNull(message = "Return date (due date) is required")
    private LocalDate returnDate;
}
