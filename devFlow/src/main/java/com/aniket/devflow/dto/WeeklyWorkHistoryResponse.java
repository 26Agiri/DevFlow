package com.aniket.devflow.dto;

public record WeeklyWorkHistoryResponse(
        String weekStart,
        String weekEnd,
        long targetSeconds,
        long workedSeconds,
        long remainingSeconds,
        double progressPercentage,
        boolean completed
) {
}