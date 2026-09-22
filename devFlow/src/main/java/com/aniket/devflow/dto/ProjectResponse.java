package com.aniket.devflow.dto;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        String status,
        LocalDateTime createdAt
)
 {
}