package com.aniket.devflow.service;

import com.aniket.devflow.dto.DashboardResponse;
import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;
import com.aniket.devflow.repository.NotificationRepository;
import com.aniket.devflow.repository.ProjectRepository;
import com.aniket.devflow.repository.TaskRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            NotificationRepository notificationRepository) {

        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
    }

    public DashboardResponse getDashboardStats(Long userId) {

        long totalProjects =
                projectRepository.countByUserId(userId);

        long totalTasks =
                taskRepository.countByProjectUserId(userId);

        long todoTasks =
                taskRepository.countByProjectUserIdAndStatus(
                        userId,
                        TaskStatus.TODO
                );

        long inProgressTasks =
                taskRepository.countByProjectUserIdAndStatus(
                        userId,
                        TaskStatus.IN_PROGRESS
                );

        long completedTasks =
                taskRepository.countByProjectUserIdAndStatus(
                        userId,
                        TaskStatus.DONE
                );

        long lowPriorityTasks =
                taskRepository.countByProjectUserIdAndPriority(
                        userId,
                        TaskPriority.LOW
                );

        long mediumPriorityTasks =
                taskRepository.countByProjectUserIdAndPriority(
                        userId,
                        TaskPriority.MEDIUM
                );

        long highPriorityTasks =
                taskRepository.countByProjectUserIdAndPriority(
                        userId,
                        TaskPriority.HIGH
                );

        long unreadNotifications =
                notificationRepository.countByUserIdAndIsReadFalse(
                        userId
                );

        return new DashboardResponse(
                totalProjects,
                totalTasks,
                todoTasks,
                inProgressTasks,
                completedTasks,
                lowPriorityTasks,
                mediumPriorityTasks,
                highPriorityTasks,
                unreadNotifications
        );
    }
}