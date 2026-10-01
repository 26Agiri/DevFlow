package com.aniket.devflow.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aniket.devflow.entity.Project;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.exception.ResourceNotFoundException;
import com.aniket.devflow.repository.ProjectRepository;
import com.aniket.devflow.repository.TaskRepository;
import com.aniket.devflow.repository.UserRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public Project createProject(String name, String description, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Project project = Project.builder()
                .name(name)
                .description(description)
                .status("TODO")
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByUser(Long userId) {
        List<Project> ownedProjects = projectRepository.findByUserId(userId);
        List<Long> assignedProjectIds = taskRepository.findDistinctProject_IdByAssignedToId(userId);
        List<Project> assignedProjects = projectRepository.findAllById(assignedProjectIds);

        Map<Long, Project> uniqueProjects = new LinkedHashMap<>();
        for (Project project : ownedProjects) {
            uniqueProjects.put(project.getId(), project);
        }
        for (Project project : assignedProjects) {
            uniqueProjects.putIfAbsent(project.getId(), project);
        }

        uniqueProjects.values().forEach(project -> project.getUser().getId());

        return uniqueProjects.values().stream().toList();
    }

    public Project updateProject(Long projectId, String name, String description, String status, Long userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        project.setName(name);
        project.setDescription(description);
        project.setStatus(status);

        return projectRepository.save(project);
    }

    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public Project getProjectById(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        boolean isOwner = project.getUser().getId().equals(userId);
        boolean isAssignedEmployee = taskRepository.existsByProjectIdAndAssignedToId(projectId, userId);

        if (!isOwner && !isAssignedEmployee) {
            throw new ResourceNotFoundException("Project not found");
        }

        project.getUser().getId();
        return project;
    }
}
