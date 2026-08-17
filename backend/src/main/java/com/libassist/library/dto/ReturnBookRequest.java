package com.libassist.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReturnBookRequest {

    @NotNull(message = "Issue id is required")
    private Long issueId;
}
