package com.libassist.library.service;

import com.libassist.library.dto.*;
import com.libassist.library.entity.Book;
import com.libassist.library.entity.Issue;
import com.libassist.library.entity.User;
import com.libassist.library.exception.BadRequestException;
import com.libassist.library.exception.NotFoundException;
import com.libassist.library.repository.BookRepository;
import com.libassist.library.repository.IssueRepository;
import com.libassist.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public IssueDto issueNewBook(IssueRequest request, Long issuedById) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new NotFoundException("Book does not exist"));

        User patron = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("Patron does not exist"));

        if (!"patron".equals(patron.getRole())) {
            throw new BadRequestException("Selected user is not a patron");
        }

        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No copies of this book are currently available");
        }

        User issuedBy = userRepository.findById(issuedById)
                .orElseThrow(() -> new NotFoundException("User does not exist"));

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LocalDateTime issueDate = LocalDateTime.now();
        LocalDateTime returnDate = request.getReturnDate().atStartOfDay();
        double rent = Math.max(0, ChronoUnit.DAYS.between(issueDate.toLocalDate(), request.getReturnDate()))
                * book.getRentPerDay();

        Issue issue = Issue.builder()
                .book(book)
                .user(patron)
                .issueDate(issueDate)
                .returnDate(returnDate)
                .rent(rent)
                .fine(0.0)
                .status("issued")
                .issuedBy(issuedBy)
                .build();

        return toDto(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getIssues(IssueFilterRequest filter) {
        Long bookId = filter != null ? filter.getBookId() : null;
        Long userId = filter != null ? filter.getUserId() : null;

        List<Issue> issues;
        if (bookId != null && userId != null) {
            issues = issueRepository.findByBookIdAndUserIdDetailed(bookId, userId);
        } else if (bookId != null) {
            issues = issueRepository.findByBookIdDetailed(bookId);
        } else if (userId != null) {
            issues = issueRepository.findByUserIdDetailed(userId);
        } else {
            issues = issueRepository.findAllDetailed();
        }

        return issues.stream().map(this::toDto).toList();
    }

    @Transactional
    public IssueDto returnBook(ReturnBookRequest request) {
        Issue issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new NotFoundException("Issue does not exist"));

        if (issue.getReturnedDate() != null) {
            throw new BadRequestException("This book has already been returned");
        }

        Book book = issue.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        LocalDate today = LocalDate.now();
        LocalDate dueDate = issue.getReturnDate().toLocalDate();
        double fine = today.isAfter(dueDate) ? ChronoUnit.DAYS.between(dueDate, today) : 0.0;

        issue.setFine(fine);
        issue.setReturnedDate(LocalDateTime.now());
        issue.setStatus("returned");

        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public void deleteIssue(DeleteIssueRequest request) {
        Issue issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new NotFoundException("Issue does not exist"));

        // only restock the copy if it hadn't already been returned (and restocked) earlier
        if (issue.getReturnedDate() == null) {
            Book book = issue.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        issueRepository.delete(issue);
    }

    @Transactional
    public IssueDto editIssue(EditIssueRequest request) {
        Issue issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new NotFoundException("Issue does not exist"));

        if (issue.getReturnedDate() != null) {
            throw new BadRequestException("Cannot renew an issue that has already been returned");
        }

        LocalDateTime newReturnDate = request.getReturnDate().atStartOfDay();
        double rent = Math.max(0, ChronoUnit.DAYS.between(issue.getIssueDate().toLocalDate(), request.getReturnDate()))
                * issue.getBook().getRentPerDay();

        issue.setReturnDate(newReturnDate);
        issue.setRent(rent);

        return toDto(issueRepository.save(issue));
    }

    private IssueDto toDto(Issue issue) {
        return IssueDto.builder()
                .id(issue.getId())
                .book(mapBook(issue.getBook()))
                .user(mapUser(issue.getUser()))
                .issueDate(issue.getIssueDate())
                .returnDate(issue.getReturnDate())
                .returnedDate(issue.getReturnedDate())
                .rent(issue.getRent())
                .fine(issue.getFine())
                .status(issue.getStatus())
                .issuedBy(issue.getIssuedBy() != null ? issue.getIssuedBy().getId() : null)
                .createdAt(issue.getCreatedAt())
                .build();
    }

    private BookDto mapBook(Book book) {
        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .description(book.getDescription())
                .categories(book.getCategories())
                .image(book.getImage())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publishedDate(book.getPublishedDate())
                .rentPerDay(book.getRentPerDay())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .createdBy(book.getCreatedBy() != null ? book.getCreatedBy().getId() : null)
                .createdAt(book.getCreatedAt())
                .build();
    }

    private UserDto mapUser(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
