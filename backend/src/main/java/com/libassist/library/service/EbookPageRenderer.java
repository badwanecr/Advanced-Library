package com.libassist.library.service;

import com.libassist.library.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDate;

/**
 * Renders one PDF page to a PNG, stamped with who is reading it.
 *
 * <p>The point is that the PDF file itself never reaches a patron's browser: they receive page
 * images, one request at a time. This cannot stop a determined reader - anything on screen can be
 * screenshotted - but it removes the browser's Save button, and the watermark makes any copy that
 * does escape traceable back to the account that opened it.
 */
@Component
public class EbookPageRenderer {

    @Value("${app.ebook.render-dpi}")
    private float dpi;

    public byte[] renderPage(Path file, int pageNumber, String readerLabel) {
        try (PDDocument document = Loader.loadPDF(file.toFile())) {
            int pageCount = document.getNumberOfPages();
            if (pageNumber < 1 || pageNumber > pageCount) {
                throw new BadRequestException("Page " + pageNumber + " does not exist; this ebook has "
                        + pageCount + " pages");
            }
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(pageNumber - 1, dpi, ImageType.RGB);
            watermark(image, readerLabel);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "png", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Could not render this page: " + e.getMessage());
        }
    }

    public int pageCount(Path file) {
        try (PDDocument document = Loader.loadPDF(file.toFile())) {
            return document.getNumberOfPages();
        } catch (IOException e) {
            throw new BadRequestException("Could not open this ebook: " + e.getMessage());
        }
    }

    /** Diagonal, semi-transparent, and repeated, so it cannot be cropped out of a screenshot. */
    private void watermark(BufferedImage image, String readerLabel) {
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.09f));
        g.setColor(Color.DARK_GRAY);
        g.setFont(new Font("SansSerif", Font.BOLD, Math.max(14, image.getWidth() / 42)));

        String text = readerLabel + " - " + LocalDate.now();
        AffineTransform original = g.getTransform();
        g.rotate(Math.toRadians(-30), image.getWidth() / 2.0, image.getHeight() / 2.0);
        int stepY = image.getHeight() / 3;
        for (int y = -stepY; y < image.getHeight() + stepY * 2; y += stepY) {
            g.drawString(text, image.getWidth() / 10, y);
        }
        g.setTransform(original);
        g.dispose();
    }
}
