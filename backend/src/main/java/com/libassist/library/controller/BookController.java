package com.libassist.library.controller;

import com.libassist.library.dto.ApiResponse;
import com.libassist.library.dto.BookDto;
import com.libassist.library.dto.BookRequest;
import com.libassist.library.security.AccessGuard;
import com.libassist.library.security.CurrentUser;
import com.libassist.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final AccessGuard accessGuard;

    @PostMapping("/add-book")
    public ApiResponse<BookDto> addBook(@Valid @RequestBody BookRequest request) {
        accessGuard.requireStaff("add books");
        BookDto book = bookService.addBook(request, CurrentUser.id());
        return ApiResponse.success("Book added successfully", book);
    }

    @PutMapping("/update-book/{id}")
    public ApiResponse<BookDto> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        accessGuard.requireStaff("edit books");
        BookDto book = bookService.updateBook(id, request);
        return ApiResponse.success("Book updated successfully", book);
    }

    @DeleteMapping("/delete-book/{id}")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        accessGuard.requireStaff("delete books");
        bookService.deleteBook(id);
        return ApiResponse.success("Book deleted successfully");
    }

    @GetMapping("/get-all-books")
    public ApiResponse<List<BookDto>> getAllBooks() {
        return ApiResponse.success("Books fetched successfully", bookService.getAllBooks());
    }

    @GetMapping("/get-book-by-id/{id}")
    public ApiResponse<BookDto> getBookById(@PathVariable Long id) {
        return ApiResponse.success("Book fetched successfully", bookService.getBookById(id));
    }
}
