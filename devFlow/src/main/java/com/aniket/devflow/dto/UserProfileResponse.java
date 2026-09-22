package com.aniket.devflow.dto;

import java.time.LocalDate;

public record UserProfileResponse(
        Long id,
        String employeeId,
        String name,
        String email,
        String role,
        String designation,
        String department,
        LocalDate joiningDate,
        String photoUrl
) {
}