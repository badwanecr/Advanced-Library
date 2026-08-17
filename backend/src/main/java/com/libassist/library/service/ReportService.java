package com.libassist.library.service;

import com.libassist.library.dto.ReportsDto;
import com.libassist.library.entity.Book;
import com.libassist.library.entity.Issue;
import com.libassist.library.entity.User;
import com.libassist.library.repository.BookRepository;
import com.libassist.library.repository.IssueRepository;
import com.libassist.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;

    public ReportsDto getReports() {
        List<Book> books = bookRepository.findAll();
        long booksCount = books.size();
        long totalCopies = books.stream().mapToLong(Book::getTotalCopies).sum();
        long availableCopies = books.stream().mapToLong(Book::getAvailableCopies).sum();
        long issuedCopies = totalCopies - availableCopies;

        List<User> users = userRepository.findAll();
        long usersCount = users.size();
        long patronsCount = users.stream().filter(u -> "patron".equals(u.getRole())).count();
        long librariansCount = users.stream().filter(u -> "librarian".equals(u.getRole())).count();
        long adminsCount = users.stream().filter(u -> "admin".equals(u.getRole())).count();

        List<Issue> issues = issueRepository.findAll();
        long issuesCount = issues.size();
        long returnedCount = issues.stream().filter(i -> i.getReturnedDate() != null).count();
        long pendingCount = issuesCount - returnedCount;

        double rentCollected = issues.stream()
                .filter(i -> i.getReturnedDate() != null)
                .mapToDouble(Issue::getRent)
                .sum();
        double fineCollected = issues.stream()
                .filter(i -> i.getReturnedDate() != null)
                .mapToDouble(i -> i.getFine() != null ? i.getFine() : 0)
                .sum();
        double rentPending = issues.stream()
                .filter(i -> i.getReturnedDate() == null)
                .mapToDouble(Issue::getRent)
                .sum();

        return ReportsDto.builder()
                .books(ReportsDto.BooksReport.builder()
                        .booksCount(booksCount)
                        .totalBooksCopiesCount(totalCopies)
                        .availableBooksCopiesCount(availableCopies)
                        .issuedBooksCopiesCount(issuedCopies)
                        .build())
                .users(ReportsDto.UsersReport.builder()
                        .usersCount(usersCount)
                        .patronsCount(patronsCount)
                        .librariansCount(librariansCount)
                        .adminsCount(adminsCount)
                        .build())
                .issues(ReportsDto.IssuesReport.builder()
                        .issuesCount(issuesCount)
                        .returnedIssuesCount(returnedCount)
                        .pendingIssuesCount(pendingCount)
                        .build())
                .revenue(ReportsDto.RevenueReport.builder()
                        .rentCollected(rentCollected)
                        .fineCollected(fineCollected)
                        .totalCollected(rentCollected + fineCollected)
                        .rentPending(rentPending)
                        .build())
                .build();
    }
}
