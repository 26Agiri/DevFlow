package com.aniket.devflow.repository;

import com.aniket.devflow.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(Long userId);

    Optional<Project> findByIdAndUserId(Long projectId, Long userId);

    long countByUserId(Long userId);
}