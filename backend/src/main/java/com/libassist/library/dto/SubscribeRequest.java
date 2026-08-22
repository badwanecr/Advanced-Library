package com.libassist.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubscribeRequest {

    /** monthly or yearly */
    @NotBlank(message = "Plan is required")
    private String plan;
}
