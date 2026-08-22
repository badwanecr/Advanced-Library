package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** An ebook catalogue entry, plus what the current user is allowed to do with it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EbookDto {
    private Long id;
    private String title;
    private String description;
    private List<String> categories;
    private String image;
    private String author;
    private String publisher;
    private LocalDate publishedDate;
    private Double rentPerMonth;
    private String pdfFileName;
    private Long pdfSizeBytes;

    /** false until a librarian uploads the file; such a title is listed but cannot be opened */
    private boolean hasPdf;

    /** true when this user may open the PDF right now */
    private boolean canRead;

    /** role, subscription, rental or none - why canRead is what it is */
    private String accessSource;

    /** when rented access ends; null unless accessSource is "rental" */
    private LocalDateTime rentalEndDate;

    /** false for staff and for subscribed patrons, who never need to rent */
    private boolean canRent;

    private Long createdBy;
}
