package com.libassist.library.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportsDto {
    private BooksReport books;
    private UsersReport users;
    private IssuesReport issues;
    private RevenueReport revenue;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BooksReport {
        private long booksCount;
        private long totalBooksCopiesCount;
        private long availableBooksCopiesCount;
        private long issuedBooksCopiesCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UsersReport {
        private long usersCount;
        private long patronsCount;
        private long librariansCount;
        private long adminsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IssuesReport {
        private long issuesCount;
        private long returnedIssuesCount;
        private long pendingIssuesCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueReport {
        private double rentCollected;
        private double fineCollected;
        private double totalCollected;
        private double rentPending;
    }
}
