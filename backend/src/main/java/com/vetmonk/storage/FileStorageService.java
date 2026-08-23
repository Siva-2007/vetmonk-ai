package com.vetmonk.storage;

import com.vetmonk.config.AppProperties;
import com.vetmonk.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation;
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "jpeg", "jpg", "png"
    );

    public FileStorageService(AppProperties appProperties) {
        this.rootLocation = Paths.get(appProperties.getStorage().getUploadDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String contentType = file.getContentType();

        // Validate MIME type
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Allowed formats: PDF, JPG, JPEG, PNG");
        }

        // Validate Extension
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Invalid file extension: " + extension);
        }

        // Generate safe randomized UUID filename
        String storedFileName = UUID.randomUUID() + "." + extension;

        try {
            Path destinationFile = this.rootLocation.resolve(storedFileName).normalize().toAbsolutePath();

            // Guard against Path Traversal
            if (!destinationFile.getParent().equals(this.rootLocation)) {
                throw new BadRequestException("Cannot store file outside current directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }
    }

    public Path load(String filename) {
        return rootLocation.resolve(filename).normalize();
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new BadRequestException("Could not read file: " + filename);
        }
    }

    public void delete(String filename) {
        try {
            Path file = load(filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            // Log and continue
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
