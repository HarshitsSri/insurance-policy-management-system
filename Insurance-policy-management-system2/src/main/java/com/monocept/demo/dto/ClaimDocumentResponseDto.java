package com.monocept.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimDocumentResponseDto {

    private Long documentId;

    private String documentName;

    private String documentType;

    private String documentUrl;
}
