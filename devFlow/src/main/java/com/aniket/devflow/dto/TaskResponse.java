package com.aniket.devflow.dto;

import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        Long projectId,
        Long assignedToId,
        String assignedToName,
        String assignedToEmail
) {}