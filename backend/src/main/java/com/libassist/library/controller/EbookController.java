package com.libassist.library.controller;

import com.libassist.library.dto.ApiResponse;
import com.libassist.library.dto.EbookAccessDto;
import com.libassist.library.dto.EbookDto;
import com.libassist.library.dto.EbookRentRequest;
import com.libassist.library.dto.EbookRequest;
import com.libassist.library.dto.SubscribeRequest;
import com.libassist.library.dto.SubscriptionDto;
import com.libassist.library.security.CurrentUser;
import com.libassist.library.service.EbookService;
import com.libassist.library.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ebooks")
@RequiredArgsConstructor
public class EbookController {

    private final EbookService ebookService;
    private final SubscriptionService subscriptionService;

    @PostMapping("/add-ebook")
    public ApiResponse<EbookDto> addEbook(@Valid @RequestBody EbookRequest request) {
        return ApiResponse.success("Ebook added successfully", ebookService.addEbook(request, CurrentUser.id()));
    }

    @PutMapping("/update-ebook/{id}")
    public ApiResponse<EbookDto> updateEbook(@PathVariable Long id, @Valid @RequestBody EbookRequest request) {
        return ApiResponse.success("Ebook updated successfully", ebookService.updateEbook(id, request, CurrentUser.id()));
    }

    @DeleteMapping("/delete-ebook/{id}")
    public ApiResponse<Void> deleteEbook(@PathVariable Long id) {
        ebookService.deleteEbook(id, CurrentUser.id());
        return ApiResponse.success("Ebook deleted successfully");
    }

    @GetMapping("/get-ebooks")
    public ApiResponse<List<EbookDto>> getEbooks() {
        return ApiResponse.success("Ebooks fetched successfully", ebookService.listEbooks(CurrentUser.id()));
    }

    @GetMapping("/get-ebook-by-id/{id}")
    public ApiResponse<EbookDto> getEbook(@PathVariable Long id) {
        return ApiResponse.success("Ebook fetched successfully", ebookService.getEbook(id, CurrentUser.id()));
    }

    /** How many pages the reader can page through. */
    @GetMapping("/page-count/{id}")
    public ApiResponse<Integer> pageCount(@PathVariable Long id) {
        return ApiResponse.success("Page count fetched successfully", ebookService.pageCount(id, CurrentUser.id()));
    }

    /**
     * One page as a watermarked PNG. This is how patrons read: the PDF file itself is never sent,
     * so the browser has no file to save and its viewer offers no download button.
     */
    @GetMapping(value = "/page/{id}/{page}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> page(@PathVariable Long id, @PathVariable int page) {
        byte[] png = ebookService.renderPage(id, page, CurrentUser.id());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(png);
    }

    /** The original PDF, for librarians and admins managing the catalogue. Not the reading path. */
    @GetMapping("/read/{id}")
    public ResponseEntity<InputStreamResource> read(@PathVariable Long id) {
        EbookService.PdfStream pdf = ebookService.openPdf(id, CurrentUser.id());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.size())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdf.fileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new InputStreamResource(pdf.content()));
    }

    @PostMapping("/upload-pdf/{id}")
    public ApiResponse<EbookDto> uploadPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Ebook uploaded successfully", ebookService.uploadPdf(id, file, CurrentUser.id()));
    }

    @DeleteMapping("/delete-pdf/{id}")
    public ApiResponse<Void> deletePdf(@PathVariable Long id) {
        ebookService.deletePdf(id, CurrentUser.id());
        return ApiResponse.success("Ebook removed successfully");
    }

    @GetMapping("/get-access")
    public ApiResponse<EbookAccessDto> getAccess() {
        return ApiResponse.success("Access fetched successfully", subscriptionService.accessSummary(CurrentUser.id()));
    }

    @PostMapping("/subscribe")
    public ApiResponse<SubscriptionDto> subscribe(@Valid @RequestBody SubscribeRequest request) {
        SubscriptionDto subscription = subscriptionService.subscribe(CurrentUser.id(), request.getPlan());
        return ApiResponse.success("Subscription activated successfully", subscription);
    }

    @PostMapping("/rent")
    public ApiResponse<EbookDto> rent(@Valid @RequestBody EbookRentRequest request) {
        EbookDto ebook = ebookService.rent(request.getEbookId(), request.getMonths(), CurrentUser.id());
        return ApiResponse.success("Ebook rented successfully", ebook);
    }
}
