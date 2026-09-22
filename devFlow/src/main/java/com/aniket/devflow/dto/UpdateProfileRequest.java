package com.aniket.devflow.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @Size(max = 100)
        String name,

        @Size(max = 50)
        String role,

        @Size(max = 100)
        String designation,

        @Size(max = 100)
        String department,

        LocalDate joiningDate,

        @Size(max = 500)
        String photoUrl
) {
}