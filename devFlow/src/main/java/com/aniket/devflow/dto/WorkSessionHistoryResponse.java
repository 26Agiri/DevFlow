package com.aniket.devflow.dto;

public record WorkSessionHistoryResponse(
        Long id,
        String date,
        String startedAt,
        String endedAt,
        long durationSeconds,
        String status
) {
}