package com.monocept.demo.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.monocept.demo.dto.ClaimStatusHistoryResponseDto;
import com.monocept.demo.dto.PageResponseDto;
import com.monocept.demo.entity.Claim;
import com.monocept.demo.entity.ClaimStatusHistory;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.ClaimStatus;
import com.monocept.demo.repository.ClaimStatusHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClaimStatusHistoryServiceImpl implements ClaimStatusHistoryService {

	private final ClaimStatusHistoryRepository historyRepository;
	private final ModelMapper modelMapper;

	@Override
	public void saveHistory(Claim claim, ClaimStatus previousStatus, ClaimStatus newStatus, String remarks,
			User updatedBy) {

		ClaimStatusHistory history = new ClaimStatusHistory();

		history.setClaim(claim);
		history.setPreviousStatus(previousStatus);
		history.setNewStatus(newStatus);
		history.setRemarks(remarks);
		history.setUpdatedBy(updatedBy);

		historyRepository.save(history);
	}

	@Override
	public PageResponseDto<ClaimStatusHistoryResponseDto> getClaimHistory(Long claimId, int page, int size,
			String sortBy, String direction) {

		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		Page<ClaimStatusHistory> historyPage = historyRepository.findByClaimClaimId(claimId, pageable);

		List<ClaimStatusHistoryResponseDto> records = historyPage.getContent().stream().map(history -> {

			ClaimStatusHistoryResponseDto dto = modelMapper.map(history, ClaimStatusHistoryResponseDto.class);

			dto.setClaimId(history.getClaim().getClaimId());

			dto.setClaimNumber(history.getClaim().getClaimNumber());

			dto.setUpdatedBy(history.getUpdatedBy().getFullName());

			return dto;
		}).toList();

		return new PageResponseDto<>(records, historyPage.getNumber(), historyPage.getSize(),
				historyPage.getTotalElements(), historyPage.getTotalPages(), historyPage.isLast(), sortBy, direction);
	}
}