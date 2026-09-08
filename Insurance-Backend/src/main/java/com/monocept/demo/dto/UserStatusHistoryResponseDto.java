package com.monocept.demo.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusHistoryResponseDto {

    private Long historyId;

    private Long userId;

    private String userFullName;

    private boolean previousStatus;

    private boolean newStatus;

    private String remarks;

    private String updatedBy;

    private LocalDateTime createdDate;
}
