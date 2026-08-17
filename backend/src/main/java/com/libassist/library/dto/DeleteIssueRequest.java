package com.libassist.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeleteIssueRequest {

    @NotNull(message = "Issue id is required")
    private Long issueId;
}
