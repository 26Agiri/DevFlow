package com.aniket.devflow.repository;

import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.TaskPriority;
import com.aniket.devflow.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {

    private TaskSpecification() {
    }

    public static Specification<Task> hasProjectId(Long projectId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("project").get("id"),
                        projectId
                );
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("status"),
                        status
                );
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("priority"),
                        priority
                );
    }

    public static Specification<Task> titleContains(String search) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + search.toLowerCase() + "%"
                );
    }
}