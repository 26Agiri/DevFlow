package com.aniket.devflow.repository;

import java.time.LocalDate;
import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TaskRepository
        extends JpaRepository<Task, Long>,
        JpaSpecificationExecutor<Task> {

    List<Task> findByProjectId(Long projectId);

    Optional<Task> findByIdAndProjectId(Long taskId, Long projectId);

    List<Task> findByProjectIdAndStatus(
            Long projectId,
            TaskStatus status
    );

    List<Task> findByProjectIdAndPriority(
            Long projectId,
            TaskPriority priority
    );

    List<Task> findByProjectIdAndTitleContainingIgnoreCase(
            Long projectId,
            String title
    );

    Page<Task> findByProjectId(
            Long projectId,
            Pageable pageable
    );
    long countByProjectUserId(Long userId);

    long countByProjectUserIdAndStatus(
            Long userId,
            TaskStatus status
    );

    long countByProjectUserIdAndPriority(
            Long userId,
            TaskPriority priority
    );
    List<Task> findByProjectUserIdAndDueDateBeforeAndStatusNot(
            Long userId,
            LocalDate date,
            TaskStatus status
    );

    List<Task> findByProjectUserIdAndDueDate(
            Long userId,
            LocalDate date
    );
}