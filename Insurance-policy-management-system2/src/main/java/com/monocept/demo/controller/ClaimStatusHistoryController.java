package com.monocept.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.monocept.demo.dto.ClaimStatusHistoryResponseDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.service.ClaimStatusHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class ClaimStatusHistoryController {

	private final ClaimStatusHistoryService historyService;

	@GetMapping("/claim/{claimId}")
	public ResponseEntity<PageResponseDto<ClaimStatusHistoryResponseDto>> getHistory(@PathVariable Long claimId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "createdDate") String sortBy,
			@RequestParam(defaultValue = "desc") String direction) {

		return ResponseEntity.ok(historyService.getClaimHistory(claimId, page, size, sortBy, direction));
	}
}