package com.libassist.library.service;

import com.libassist.library.dto.EbookDto;
import com.libassist.library.dto.EbookRequest;
import com.libassist.library.entity.Ebook;
import com.libassist.library.entity.EbookRental;
import com.libassist.library.entity.Subscription;
import com.libassist.library.entity.User;
import com.libassist.library.exception.BadRequestException;
import com.libassist.library.exception.NotFoundException;
import com.libassist.library.repository.EbookRentalRepository;
import com.libassist.library.repository.EbookRepository;
import com.libassist.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** The digital catalogue: its own titles, its own PDFs, its own rentals. */
@Service
@RequiredArgsConstructor
public class EbookService {

    private final EbookRepository ebookRepository;
    private final UserRepository userRepository;
    private final EbookRentalRepository ebookRentalRepository;
    private final SubscriptionService subscriptionService;
    private final EbookPageRenderer pageRenderer;

    @Value("${app.ebook.storage-dir}")
    private String storageDir;

    @Value("${app.ebook.max-file-size-mb}")
    private long maxFileSizeMb;

    // ----- catalogue management (librarians and admins) -----

    @Transactional
    public EbookDto addEbook(EbookRequest request, Long userId) {
        User user = requireStaff(userId, "add ebooks");

        Ebook ebook = Ebook.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .categories(request.getCategories())
                .image(request.getImage())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishedDate(request.getPublishedDate())
                .rentPerMonth(request.getRentPerMonth())
                .createdBy(user)
                .build();

        return toDto(ebookRepository.save(ebook), user);
    }

    @Transactional
    public EbookDto updateEbook(Long id, EbookRequest request, Long userId) {
        User user = requireStaff(userId, "edit ebooks");
        Ebook ebook = requireEbook(id);

        ebook.setTitle(request.getTitle());
        ebook.setDescription(request.getDescription());
        ebook.setCategories(request.getCategories());
        ebook.setImage(request.getImage());
        ebook.setAuthor(request.getAuthor());
        ebook.setPublisher(request.getPublisher());
        ebook.setPublishedDate(request.getPublishedDate());
        ebook.setRentPerMonth(request.getRentPerMonth());

        return toDto(ebookRepository.save(ebook), user);
    }

    @Transactional
    public void deleteEbook(Long id, Long userId) {
        requireStaff(userId, "delete ebooks");
        Ebook ebook = requireEbook(id);
        String stored = ebook.getPdfPath();
        ebookRepository.delete(ebook);
        deleteQuietly(stored);
    }

    // ----- reading -----

    public List<EbookDto> listEbooks(Long userId) {
        User user = requireUser(userId);
        return ebookRepository.findAllByOrderByTitleAsc().stream()
                .map(ebook -> toDto(ebook, user))
                .toList();
    }

    public EbookDto getEbook(Long id, Long userId) {
        User user = requireUser(userId);
        return toDto(requireEbook(id), user);
    }

    /**
     * The single gate every read goes through. Staff read everything; a patron needs either a
     * live subscription or a live rental of this particular title.
     */
    public String accessSource(Ebook ebook, User user) {
        if (subscriptionService.isStaff(user)) {
            return "role";
        }
        Optional<Subscription> subscription = subscriptionService.activeSubscription(user.getId());
        if (subscription.isPresent()) {
            return "subscription";
        }
        return activeRental(user.getId(), ebook.getId()).isPresent() ? "rental" : "none";
    }

    private Optional<EbookRental> activeRental(Long userId, Long ebookId) {
        return ebookRentalRepository
                .findFirstByUserIdAndEbookIdAndEndDateAfterOrderByEndDateDesc(userId, ebookId, LocalDateTime.now());
    }

    /**
     * Hands over the PDF file itself. Staff only - this is the management download, not the
     * reading path. Patrons read through {@link #renderPage} so the file never leaves the server.
     */
    public PdfStream openPdf(Long id, Long userId) {
        requireStaff(userId, "download ebook files");
        Ebook ebook = requireEbook(id);
        if (ebook.getPdfPath() == null) {
            throw new NotFoundException("No PDF has been uploaded for this ebook yet");
        }

        Path file = storagePath().resolve(ebook.getPdfPath());
        if (!Files.exists(file)) {
            throw new NotFoundException("The PDF for this ebook is missing from storage");
        }
        try {
            return new PdfStream(Files.newInputStream(file), Files.size(file), ebook.getPdfFileName());
        } catch (IOException e) {
            throw new BadRequestException("Could not read the PDF: " + e.getMessage());
        }
    }

    /** How many pages this reader may page through. Same access gate as reading. */
    public int pageCount(Long id, Long userId) {
        return pageRenderer.pageCount(readableFile(id, userId));
    }

    /** One page, as a PNG watermarked with the reader's identity. */
    public byte[] renderPage(Long id, int pageNumber, Long userId) {
        User user = requireUser(userId);
        Path file = readableFile(id, userId);
        String label = user.getName() + " <" + user.getEmail() + ">";
        return pageRenderer.renderPage(file, pageNumber, label);
    }

    /** Runs the access check once and resolves the file on disk. */
    private Path readableFile(Long id, Long userId) {
        User user = requireUser(userId);
        Ebook ebook = requireEbook(id);
        if (ebook.getPdfPath() == null) {
            throw new NotFoundException("No PDF has been uploaded for this ebook yet");
        }
        if ("none".equals(accessSource(ebook, user))) {
            throw new BadRequestException("Subscribe or rent this ebook to read it");
        }
        Path file = storagePath().resolve(ebook.getPdfPath());
        if (!Files.exists(file)) {
            throw new NotFoundException("The PDF for this ebook is missing from storage");
        }
        return file;
    }

    // ----- the file itself -----

    @Transactional
    public EbookDto uploadPdf(Long id, MultipartFile file, Long userId) {
        User user = requireStaff(userId, "upload ebooks");
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a PDF file to upload");
        }
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (!original.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files are accepted");
        }
        if (file.getSize() > maxFileSizeMb * 1024 * 1024) {
            throw new BadRequestException("The PDF must be " + maxFileSizeMb + " MB or smaller");
        }

        Ebook ebook = requireEbook(id);
        String storedName = "ebook-" + id + "-" + UUID.randomUUID() + ".pdf";
        Path target = storagePath().resolve(storedName);
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not save the PDF: " + e.getMessage());
        }

        String previous = ebook.getPdfPath();
        ebook.setPdfPath(storedName);
        ebook.setPdfFileName(original);
        ebook.setPdfSizeBytes(file.getSize());
        ebook.setPdfUploadedAt(LocalDateTime.now());
        ebookRepository.save(ebook);
        deleteQuietly(previous);

        return toDto(ebook, user);
    }

    @Transactional
    public void deletePdf(Long id, Long userId) {
        requireStaff(userId, "remove ebooks");
        Ebook ebook = requireEbook(id);
        if (ebook.getPdfPath() == null) {
            throw new BadRequestException("This ebook has no PDF");
        }
        String stored = ebook.getPdfPath();
        ebook.setPdfPath(null);
        ebook.setPdfFileName(null);
        ebook.setPdfSizeBytes(null);
        ebook.setPdfUploadedAt(null);
        ebookRepository.save(ebook);
        deleteQuietly(stored);
    }

    // ----- renting -----

    @Transactional
    public EbookDto rent(Long ebookId, int months, Long userId) {
        User user = requireUser(userId);
        if (subscriptionService.isStaff(user)) {
            throw new BadRequestException("Librarians and admins already read every ebook");
        }
        if (subscriptionService.activeSubscription(userId).isPresent()) {
            throw new BadRequestException("Your subscription already covers every ebook");
        }

        Ebook ebook = requireEbook(ebookId);
        if (ebook.getPdfPath() == null) {
            throw new BadRequestException("This ebook is not available to read yet");
        }
        if (activeRental(userId, ebookId).isPresent()) {
            throw new BadRequestException("You have already rented this ebook");
        }

        LocalDateTime now = LocalDateTime.now();
        EbookRental rental = EbookRental.builder()
                .ebook(ebook)
                .user(user)
                .startDate(now)
                .endDate(now.plusMonths(months))
                .months(months)
                .amount(Math.round(ebook.getRentPerMonth() * months * 100.0) / 100.0)
                .build();
        ebookRentalRepository.save(rental);

        return toDto(ebook, user);
    }

    // ----- helpers -----

    private EbookDto toDto(Ebook ebook, User user) {
        String source = accessSource(ebook, user);
        boolean hasPdf = ebook.getPdfPath() != null;
        LocalDateTime rentalEnd = "rental".equals(source)
                ? activeRental(user.getId(), ebook.getId()).map(EbookRental::getEndDate).orElse(null)
                : null;

        return EbookDto.builder()
                .id(ebook.getId())
                .title(ebook.getTitle())
                .description(ebook.getDescription())
                .categories(ebook.getCategories())
                .image(ebook.getImage())
                .author(ebook.getAuthor())
                .publisher(ebook.getPublisher())
                .publishedDate(ebook.getPublishedDate())
                .rentPerMonth(ebook.getRentPerMonth())
                .pdfFileName(ebook.getPdfFileName())
                .pdfSizeBytes(ebook.getPdfSizeBytes())
                .hasPdf(hasPdf)
                // a title with no file uploaded yet cannot be opened by anyone, staff included
                .canRead(hasPdf && !"none".equals(source))
                .accessSource(source)
                .rentalEndDate(rentalEnd)
                .canRent(hasPdf && "none".equals(source))
                .createdBy(ebook.getCreatedBy() != null ? ebook.getCreatedBy().getId() : null)
                .build();
    }

    private Path storagePath() {
        return Paths.get(storageDir).toAbsolutePath().normalize();
    }

    private void deleteQuietly(String storedName) {
        if (storedName == null) {
            return;
        }
        try {
            Files.deleteIfExists(storagePath().resolve(storedName));
        } catch (IOException ignored) {
            // a stale file on disk should not fail the request
        }
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User does not exist"));
    }

    private User requireStaff(Long userId, String action) {
        User user = requireUser(userId);
        if (!subscriptionService.isStaff(user)) {
            throw new BadRequestException("Only librarians and admins can " + action);
        }
        return user;
    }

    private Ebook requireEbook(Long id) {
        return ebookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ebook does not exist"));
    }

    /** Small carrier so the controller can stream without knowing about storage paths. */
    public record PdfStream(InputStream content, long size, String fileName) {
    }
}
