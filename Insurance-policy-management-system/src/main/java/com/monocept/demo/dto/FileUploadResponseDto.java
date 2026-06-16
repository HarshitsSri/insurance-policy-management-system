package com.monocept.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponseDto {

    private String documentUrl;

    private String publicId;

    private String documentName;

    private String documentType;
}
