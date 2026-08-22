package com.libassist.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/** Catalogue fields for an ebook. No copy counts: a digital title has no shelf. */
@Data
public class EbookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotEmpty(message = "At least one category is required")
    private List<String> categories;

    @NotBlank(message = "Cover image URL is required")
    private String image;

    @NotBlank(message = "Author is required")
    private String author;

    @NotBlank(message = "Publisher is required")
    private String publisher;

    @NotNull(message = "Published date is required")
    private LocalDate publishedDate;

    @NotNull(message = "Rent per month is required")
    @Positive(message = "Rent per month must be positive")
    private Double rentPerMonth;
}
