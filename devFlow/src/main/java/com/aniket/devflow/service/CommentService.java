package com.aniket.devflow.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aniket.devflow.dto.CommentRequest;
import com.aniket.devflow.dto.CommentResponse;
import com.aniket.devflow.entity.Comment;
import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.exception.ResourceNotFoundException;
import com.aniket.devflow.repository.CommentRepository;
import com.aniket.devflow.repository.TaskRepository;
import com.aniket.devflow.repository.UserRepository;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
   @Transactional
public CommentResponse createComment(
        Long projectId,
        Long taskId,
        CommentRequest request,
        Long userId) {

    // Find the task inside the project
    Task task = taskRepository
            .findByIdAndProjectId(taskId, projectId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Task not found")
            );

    // Check project owner
    boolean isOwner =
            task.getProject()
                    .getUser()
                    .getId()
                    .equals(userId);

    // Check assigned employee
    User assignedUser = task.getAssignedTo();

    boolean isAssignedEmployee =
            assignedUser != null
                    && assignedUser.getId().equals(userId);

    // Only owner or assigned employee can add comments
    if (!isOwner && !isAssignedEmployee) {
        throw new ResourceNotFoundException("Task not found");
    }

    // Get logged-in user
    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));

    // Create comment
    Comment comment = Comment.builder()
            .content(request.content())
            .createdAt(LocalDateTime.now(ZoneOffset.UTC))
            .task(task)
            .user(user)
            .build();

    Comment savedComment = commentRepository.save(comment);

    return mapToResponse(savedComment);
}
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(
            Long projectId,
            Long taskId,
            Long userId
    ) {

        // Find the task inside the project
        Task task = taskRepository
                .findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found")
                );

        // Project owner
        boolean isOwner =
                task.getProject()
                        .getUser()
                        .getId()
                        .equals(userId);

        // Employee assigned to this task
        User assignedUser = task.getAssignedTo();

        boolean isAssignedEmployee =
                assignedUser != null
                        && assignedUser.getId().equals(userId);

        // Only owner or assigned employee can read comments
        if (!isOwner && !isAssignedEmployee) {
            throw new ResourceNotFoundException("Task not found");
        }

        return commentRepository
                .findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteComment(
            Long projectId,
            Long taskId,
            Long commentId,
            Long userId) {

        taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        Comment comment = commentRepository
                .findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You can delete only your own comment"
            );
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {

        User user = comment.getUser();

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt().atOffset(ZoneOffset.UTC),
                comment.getTask().getId(),
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
    @Transactional
    public CommentResponse updateComment(
            Long projectId,
            Long taskId,
            Long commentId,
            CommentRequest request,
            Long userId) {

        taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        Comment comment = commentRepository
                .findByIdAndTaskIdAndUserId(
                        commentId,
                        taskId,
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Comment not found or you are not the owner"
                        ));

        comment.setContent(request.content());

        Comment updatedComment = commentRepository.save(comment);

        return mapToResponse(updatedComment);
    }
}