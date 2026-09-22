package com.aniket.devflow.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.ProjectRequest;
import com.aniket.devflow.dto.ProjectResponse;
import com.aniket.devflow.dto.ProjectUpdateRequest;
import com.aniket.devflow.entity.Project;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.ProjectService;
import com.aniket.devflow.service.UserService;
import com.aniket.devflow.service.WorkspaceAccessService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final WorkspaceAccessService workspaceAccessService;

    public ProjectController(
            ProjectService projectService,
            UserService userService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.projectService = projectService;
        this.userService = userService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        Project project = projectService.createProject(
                request.name(),
                request.description(),
                user.getId()
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getCreatedAt()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        List<ProjectResponse> responses =
                projectService.getProjectsByUser(user.getId())
                        .stream()
                        .map(project -> new ProjectResponse(
                                project.getId(),
                                project.getName(),
                                project.getDescription(),
                                project.getStatus(),
                                project.getCreatedAt()
                        ))
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        Project project = projectService.updateProject(
                id,
                request.name(),
                request.description(),
                request.status(),
                user.getId()
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        projectService.deleteProject(
                id,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        Project project = projectService.getProjectById(
                id,
                user.getId()
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }
}