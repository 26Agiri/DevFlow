package com.aniket.devflow.dto;

import java.time.OffsetDateTime;

public record CommentResponse(
        Long id,
        String content,
        OffsetDateTime createdAt,
        Long taskId,
        Long userId,
        String userName,
        String userEmail
) {}