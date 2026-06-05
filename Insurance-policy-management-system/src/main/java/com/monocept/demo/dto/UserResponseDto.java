package com.monocept.demo.dto;



import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {

    private Long id;

    private String fullName;

    private String email;

    private String mobileNumber;

    private Role role;

    private Boolean active;

    private LocalDateTime createdDate;
}
