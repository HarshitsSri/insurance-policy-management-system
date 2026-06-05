package com.monocept.demo.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimDocumentRequestDto {

    private String documentName;

    private String documentType;

    private String documentReference;
}