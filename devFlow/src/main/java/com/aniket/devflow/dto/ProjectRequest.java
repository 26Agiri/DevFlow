package com.aniket.devflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 100, message = "Project name must not exceed 100 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description
) {
}