package com.aniket.devflow.dto;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String content,
        LocalDateTime createdAt,
        Long taskId,
        Long userId,
        String userName,
        String userEmail
) {}