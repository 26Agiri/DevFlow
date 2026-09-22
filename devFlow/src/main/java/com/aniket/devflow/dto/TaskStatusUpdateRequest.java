package com.aniket.devflow.dto;

import com.aniket.devflow.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(

        @NotNull(message = "Task status is required")
        TaskStatus status
) {}