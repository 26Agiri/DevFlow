package com.aniket.devflow.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.TaskRequest;
import com.aniket.devflow.dto.TaskResponse;
import com.aniket.devflow.dto.TaskStatusUpdateRequest;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.TaskService;
import com.aniket.devflow.service.UserService;
import com.aniket.devflow.service.WorkspaceAccessService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final WorkspaceAccessService workspaceAccessService;

    public TaskController(
            TaskService taskService,
            UserService userService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.taskService = taskService;
        this.userService = userService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        TaskResponse response = taskService.createTask(
                projectId,
                request,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        List<TaskResponse> tasks = taskService.getTasksByProject(
                projectId,
                user.getId(),
                status,
                priority,
                search
        );

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        TaskResponse response = taskService.getTaskById(
                projectId,
                taskId,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        TaskResponse response = taskService.updateTask(
                projectId,
                taskId,
                request,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        taskService.deleteTask(
                projectId,
                taskId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        TaskResponse response = taskService.updateTaskStatus(
                projectId,
                taskId,
                request,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<TaskResponse>> getTasksPaginated(
            @PathVariable Long projectId,
            Pageable pageable,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        Page<TaskResponse> tasks =
                taskService.getTasksByProjectPaginated(
                        projectId,
                        user.getId(),
                        pageable
                );

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/filtered")
    public ResponseEntity<Page<TaskResponse>> getFilteredTasks(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            Pageable pageable,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        Page<TaskResponse> tasks =
                taskService.getFilteredTasks(
                        projectId,
                        user.getId(),
                        status,
                        priority,
                        search,
                        pageable
                );

        return ResponseEntity.ok(tasks);
    }
}