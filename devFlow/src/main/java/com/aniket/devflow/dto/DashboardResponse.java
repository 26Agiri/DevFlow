package com.aniket.devflow.dto;

public record DashboardResponse(
        long totalProjects,
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long completedTasks,
        long lowPriorityTasks,
        long mediumPriorityTasks,
        long highPriorityTasks,
        long unreadNotifications
) {}