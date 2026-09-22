package com.aniket.devflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.TaskResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.TaskService;
import com.aniket.devflow.service.UserService;
import com.aniket.devflow.service.WorkspaceAccessService;

@RestController
@RequestMapping("/api/tasks")
public class TaskDueDateController {

    private final TaskService taskService;
    private final UserService userService;
    private final WorkspaceAccessService workspaceAccessService;

    public TaskDueDateController(
            TaskService taskService,
            UserService userService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.taskService = taskService;
        this.userService = userService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks(
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        List<TaskResponse> tasks =
                taskService.getOverdueTasks(user.getId());

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/due-today")
    public ResponseEntity<List<TaskResponse>> getTasksDueToday(
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        List<TaskResponse> tasks =
                taskService.getTasksDueToday(user.getId());

        return ResponseEntity.ok(tasks);
    }
}