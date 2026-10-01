package com.aniket.devflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aniket.devflow.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(Long userId);

    Optional<Project> findByIdAndUserId(Long projectId, Long userId);

    long countByUserId(Long userId);
}