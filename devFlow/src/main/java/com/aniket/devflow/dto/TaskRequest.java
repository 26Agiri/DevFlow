package com.aniket.devflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(

        @NotBlank(message = "Task title is required")
        @Size(max = 150, message = "Task title must not exceed 150 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotBlank(message = "Task priority is required")
        String priority,

        LocalDate dueDate,

        @Email(message = "Enter a valid assigned user email")
        String assignedTo
) {}