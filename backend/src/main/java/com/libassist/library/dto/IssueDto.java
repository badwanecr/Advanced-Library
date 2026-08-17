package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueDto {
    private Long id;
    private BookDto book;
    private UserDto user;
    private LocalDateTime issueDate;
    private LocalDateTime returnDate;
    private LocalDateTime returnedDate;
    private Double rent;
    private Double fine;
    private String status;
    private Long issuedBy;
    private LocalDateTime createdAt;
}
