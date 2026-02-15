package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path fileStoragePath;

    @PostConstruct
    public void init() {
        this.fileStoragePath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Create directory if not exists
        File directory = new File(this.fileStoragePath.toString());
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 🔥 IMPORTANT: Console output dekho
        System.out.println("==========================================");
        System.out.println("🔥 FILE STORAGE SERVICE INITIALIZED");
        System.out.println("📁 uploadDir property: " + uploadDir);
        System.out.println("📁 Absolute path: " + this.fileStoragePath.toString());
        System.out.println("📂 Directory exists: " + directory.exists());

        if (directory.exists()) {
            System.out.println("📂 Files in directory: " +
                    Arrays.toString(directory.listFiles()));
        }
        System.out.println("==========================================");
    }

    public String storeFile(MultipartFile file, String eventName) {
        try {
            // Clean event name for filename
            String cleanEventName = eventName.replaceAll("[^a-zA-Z0-9]", "_");

            // Get file extension
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            // Create unique filename: event-name_timestamp.jpg
            String fileName = cleanEventName + "_" + System.currentTimeMillis() + fileExtension;

            // Full path
            Path targetLocation = fileStoragePath.resolve(fileName);

            // Copy file
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 🔥 Log file save details
            System.out.println("==========================================");
            System.out.println("✅ FILE SAVED SUCCESSFULLY");
            System.out.println("📄 File name: " + fileName);
            System.out.println("📂 Saved to: " + targetLocation.toString());
            System.out.println("🔗 Image URL: /uploads/events/" + fileName);
            System.out.println("🌐 Full URL: http://localhost:8080/uploads/events/" + fileName);
            System.out.println("==========================================");

            // Return relative path to store in database
            return "/uploads/events/" + fileName;

        } catch (IOException e) {
            System.err.println("❌ ERROR SAVING FILE: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to store file", e);
        }
    }
}