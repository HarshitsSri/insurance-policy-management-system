package com.monocept.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.monocept.demo.dto.FileUploadResponseDto;
import com.monocept.demo.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/claim-documents")
@RequiredArgsConstructor
public class ClaimDocumentController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponseDto>
            uploadDocument(

            @RequestParam MultipartFile file,

            @RequestParam String documentName,

            @RequestParam String documentType) {

        return ResponseEntity.ok(
                cloudinaryService.uploadDocument(
                        file,
                        documentName,
                        documentType
                )
        );
    }
}