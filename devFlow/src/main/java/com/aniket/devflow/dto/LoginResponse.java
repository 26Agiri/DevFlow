package com.aniket.devflow.dto;

public record LoginResponse(
        String token,
        boolean heartbeatTimeout
) {
}