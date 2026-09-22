package com.aniket.devflow.service;

import com.aniket.devflow.entity.Project;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.repository.ProjectRepository;
import com.aniket.devflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.aniket.devflow.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Project createProject(
            String name,
            String description,
            Long userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Project project = Project.builder()
                .name(name)
                .description(description)
                .status("TODO")
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return projectRepository.save(project);
    }

    public List<Project> getProjectsByUser(Long userId) {
        return projectRepository.findByUserId(userId);
    }
    public Project updateProject(
            Long projectId,
            String name,
            String description,
            String status,
            Long userId
    ) {

        Project project = projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        project.setName(name);
        project.setDescription(description);
        project.setStatus(status);

        return projectRepository.save(project);
    }
    public void deleteProject(Long projectId, Long userId) {

        Project project = projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        projectRepository.delete(project);
    }
    public Project getProjectById(Long projectId, Long userId) {

        return projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );
    }
}