package com.libassist.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotEmpty(message = "At least one category is required")
    private List<String> categories;

    @NotBlank(message = "Image URL is required")
    private String image;

    @NotBlank(message = "Author is required")
    private String author;

    @NotBlank(message = "Publisher is required")
    private String publisher;

    @NotNull(message = "Published date is required")
    private LocalDate publishedDate;

    @NotNull(message = "Rent per day is required")
    @Positive(message = "Rent per day must be positive")
    private Double rentPerDay;

    @NotNull(message = "Total copies is required")
    @Positive(message = "Total copies must be positive")
    private Integer totalCopies;

    /** Only used on update; ignored when adding a new book (defaults to totalCopies). */
    private Integer availableCopies;
}
