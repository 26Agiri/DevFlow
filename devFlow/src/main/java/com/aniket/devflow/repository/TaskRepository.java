package com.aniket.devflow.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;

public interface TaskRepository
        extends JpaRepository<Task, Long>,
        JpaSpecificationExecutor<Task> {

    // =========================
    // PROJECT TASKS
    // =========================

    List<Task> findByProjectId(Long projectId);

    Optional<Task> findByIdAndProjectId(
            Long taskId,
            Long projectId
    );

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


    // =========================
    // ASSIGNED EMPLOYEE TASKS
    // =========================

    List<Task> findByProjectIdAndAssignedToId(
            Long projectId,
            Long userId
    );

    List<Task> findByProjectIdAndAssignedToIdAndStatus(
            Long projectId,
            Long userId,
            TaskStatus status
    );

    List<Task> findByProjectIdAndAssignedToIdAndPriority(
            Long projectId,
            Long userId,
            TaskPriority priority
    );

    List<Task> findByProjectIdAndAssignedToIdAndTitleContainingIgnoreCase(
            Long projectId,
            Long userId,
            String title
    );

    Page<Task> findByProjectIdAndAssignedToId(
            Long projectId,
            Long userId,
            Pageable pageable
    );
List<Long> findDistinctProject_IdByAssignedToId(Long userId);

    Optional<Task> findByIdAndProjectIdAndAssignedToId(
            Long taskId,
            Long projectId,
            Long userId
    );

    boolean existsByProjectIdAndAssignedToId(
            Long projectId,
            Long userId
    );

    boolean existsByIdAndProjectIdAndAssignedToId(
            Long taskId,
            Long projectId,
            Long userId
    );


    // =========================
    // PROJECT OWNER STATISTICS
    // =========================

    long countByProjectUserId(Long userId);

    long countByProjectUserIdAndStatus(
            Long userId,
            TaskStatus status
    );

    long countByProjectUserIdAndPriority(
            Long userId,
            TaskPriority priority
    );


    // =========================
    // DUE TASKS
    // =========================

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