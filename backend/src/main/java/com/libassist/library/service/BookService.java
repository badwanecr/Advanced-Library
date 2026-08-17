package com.libassist.library.service;

import com.libassist.library.dto.BookDto;
import com.libassist.library.dto.BookRequest;
import com.libassist.library.entity.Book;
import com.libassist.library.entity.User;
import com.libassist.library.exception.NotFoundException;
import com.libassist.library.repository.BookRepository;
import com.libassist.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookDto addBook(BookRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new NotFoundException("User does not exist"));

        Book book = Book.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .categories(request.getCategories())
                .image(request.getImage())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishedDate(request.getPublishedDate())
                .rentPerDay(request.getRentPerDay())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .createdBy(creator)
                .build();

        return toDto(bookRepository.save(book));
    }

    @Transactional
    public BookDto updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Book does not exist"));

        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());
        book.setCategories(request.getCategories());
        book.setImage(request.getImage());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setPublishedDate(request.getPublishedDate());
        book.setRentPerDay(request.getRentPerDay());
        book.setTotalCopies(request.getTotalCopies());
        if (request.getAvailableCopies() != null) {
            book.setAvailableCopies(request.getAvailableCopies());
        }

        return toDto(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new NotFoundException("Book does not exist");
        }
        bookRepository.deleteById(id);
    }

    public List<BookDto> getAllBooks() {
        return bookRepository.findAllByOrderByTitleAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Book does not exist"));
        return toDto(book);
    }

    private BookDto toDto(Book book) {
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
}
