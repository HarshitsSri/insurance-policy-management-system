package com.monocept.demo.service;

import org.springframework.web.multipart.MultipartFile;

import com.monocept.demo.dto.FileUploadResponseDto;

public interface CloudinaryService {

    FileUploadResponseDto uploadDocument(
            MultipartFile file,
            String documentName,
            String documentType
    );
}
