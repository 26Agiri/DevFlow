package com.aniket.devflow.dto;

public record UserResponse(
        Long id,
        String name,
        String email
) {
}