package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDto {
    private Long id;
    private String title;
    private String description;
    private List<String> categories;
    private String image;
    private String author;
    private String publisher;
    private LocalDate publishedDate;
    private Double rentPerDay;
    private Integer totalCopies;
    private Integer availableCopies;
    private Long createdBy;
    private LocalDateTime createdAt;
}
