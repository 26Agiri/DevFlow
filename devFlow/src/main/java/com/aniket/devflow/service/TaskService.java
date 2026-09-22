package com.aniket.devflow.service;

import com.aniket.devflow.dto.TaskRequest;
import com.aniket.devflow.dto.TaskResponse;
import com.aniket.devflow.dto.TaskStatusUpdateRequest;
import com.aniket.devflow.entity.Project;
import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.exception.ResourceNotFoundException;
import com.aniket.devflow.repository.ProjectRepository;
import com.aniket.devflow.repository.TaskRepository;
import com.aniket.devflow.repository.TaskSpecification;
import com.aniket.devflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public TaskResponse createTask(
            Long projectId,
            TaskRequest request,
            Long userId) {

        Project project = projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User assignedUser = getAssignedUser(request.assignedTo());

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .status(TaskStatus.TODO)
                .priority(parsePriority(request.priority()))
                .dueDate(request.dueDate())
                .createdAt(LocalDateTime.now())
                .project(project)
                .assignedTo(assignedUser)
                .build();

        Task savedTask = taskRepository.save(task);

        if (assignedUser != null) {
            notificationService.createNotification(
                    assignedUser.getId(),
                    "You have been assigned a new task: "
                            + savedTask.getTitle()
            );
        }

        return mapToResponse(savedTask);
    }

    public List<TaskResponse> getTasksByProject(
            Long projectId,
            Long userId,
            String status,
            String priority,
            String search) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        List<Task> tasks;

        if (status != null && !status.isBlank()) {

            TaskStatus taskStatus;

            try {
                taskStatus = TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid status. Allowed values: TODO, IN_PROGRESS, DONE"
                );
            }

            tasks = taskRepository.findByProjectIdAndStatus(
                    projectId,
                    taskStatus
            );

        } else if (priority != null && !priority.isBlank()) {

            TaskPriority taskPriority;

            try {
                taskPriority = TaskPriority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid priority. Allowed values: LOW, MEDIUM, HIGH"
                );
            }

            tasks = taskRepository.findByProjectIdAndPriority(
                    projectId,
                    taskPriority
            );

        } else if (search != null && !search.isBlank()) {

            tasks = taskRepository
                    .findByProjectIdAndTitleContainingIgnoreCase(
                            projectId,
                            search
                    );

        } else {

            tasks = taskRepository.findByProjectId(projectId);
        }

        return tasks.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<TaskResponse> getTasksByProjectPaginated(
            Long projectId,
            Long userId,
            Pageable pageable) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        return taskRepository
                .findByProjectId(projectId, pageable)
                .map(this::mapToResponse);
    }

    public TaskResponse getTaskById(
            Long projectId,
            Long taskId,
            Long userId) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Task task = taskRepository
                .findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        return mapToResponse(task);
    }

    public TaskResponse updateTask(
            Long projectId,
            Long taskId,
            TaskRequest request,
            Long userId) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Task task = taskRepository
                .findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        User oldAssignedUser = task.getAssignedTo();
        User newAssignedUser = getAssignedUser(request.assignedTo());

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(parsePriority(request.priority()));
        task.setDueDate(request.dueDate());
        task.setAssignedTo(newAssignedUser);

        Task updatedTask = taskRepository.save(task);

        if (newAssignedUser != null &&
                (oldAssignedUser == null ||
                        !oldAssignedUser.getId().equals(newAssignedUser.getId()))) {

            notificationService.createNotification(
                    newAssignedUser.getId(),
                    "You have been assigned a new task: "
                            + updatedTask.getTitle()
            );
        }

        return mapToResponse(updatedTask);
    }

    public void deleteTask(
            Long projectId,
            Long taskId,
            Long userId) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Task task = taskRepository
                .findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
    }

    public TaskResponse updateTaskStatus(
            Long projectId,
            Long taskId,
            TaskStatusUpdateRequest request,
            Long userId) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Task task = taskRepository
                .findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        TaskStatus oldStatus = task.getStatus();

        task.setStatus(request.status());

        Task updatedTask = taskRepository.save(task);

        if (oldStatus != request.status()) {

            User assignedUser = task.getAssignedTo();

            if (assignedUser != null) {
                notificationService.createNotification(
                        assignedUser.getId(),
                        "Task status changed: "
                                + updatedTask.getTitle()
                                + " → "
                                + updatedTask.getStatus()
                );
            }
        }

        return mapToResponse(updatedTask);
    }

    public Page<TaskResponse> getFilteredTasks(
            Long projectId,
            Long userId,
            String status,
            String priority,
            String search,
            Pageable pageable) {

        projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        Specification<Task> specification =
                TaskSpecification.hasProjectId(projectId);

        if (status != null && !status.isBlank()) {

            TaskStatus taskStatus;

            try {
                taskStatus = TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid status. Allowed values: TODO, IN_PROGRESS, DONE"
                );
            }

            specification = specification.and(
                    TaskSpecification.hasStatus(taskStatus)
            );
        }

        if (priority != null && !priority.isBlank()) {

            TaskPriority taskPriority;

            try {
                taskPriority = TaskPriority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid priority. Allowed values: LOW, MEDIUM, HIGH"
                );
            }

            specification = specification.and(
                    TaskSpecification.hasPriority(taskPriority)
            );
        }

        if (search != null && !search.isBlank()) {

            specification = specification.and(
                    TaskSpecification.titleContains(search)
            );
        }

        return taskRepository
                .findAll(specification, pageable)
                .map(this::mapToResponse);
    }

    private User getAssignedUser(String email) {

        if (email == null || email.isBlank()) {
            return null;
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Assigned user not found"
                        ));
    }

    private TaskPriority parsePriority(String priority) {

        try {
            return TaskPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid priority. Allowed values: LOW, MEDIUM, HIGH"
            );
        }
    }

    private TaskResponse mapToResponse(Task task) {

        User assignedUser = task.getAssignedTo();

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getProject().getId(),
                assignedUser != null ? assignedUser.getId() : null,
                assignedUser != null ? assignedUser.getName() : null,
                assignedUser != null ? assignedUser.getEmail() : null
        );
    }
    public List<TaskResponse> getOverdueTasks(Long userId) {

        LocalDate today = LocalDate.now();

        return taskRepository
                .findByProjectUserIdAndDueDateBeforeAndStatusNot(
                        userId,
                        today,
                        TaskStatus.DONE
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TaskResponse> getTasksDueToday(Long userId) {

        LocalDate today = LocalDate.now();

        return taskRepository
                .findByProjectUserIdAndDueDate(
                        userId,
                        today
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}