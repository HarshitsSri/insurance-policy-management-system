package com.monocept.demo.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.monocept.demo.dto.FileUploadResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

	private final Cloudinary cloudinary;

	@Override
	public FileUploadResponseDto uploadDocument(MultipartFile file, String documentName, String documentType) {

		try {

			Map result = cloudinary.uploader().upload(file.getBytes(),
					ObjectUtils.asMap("folder", "insurance-claims", "resource_type", "auto"));

			return new FileUploadResponseDto(result.get("secure_url").toString(), result.get("public_id").toString(),
					documentName, documentType);

		} catch (Exception e) {

			throw new RuntimeException("Upload Failed");
		}
	}
}