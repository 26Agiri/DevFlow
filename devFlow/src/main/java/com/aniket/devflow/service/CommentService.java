package com.aniket.devflow.service;

import com.aniket.devflow.dto.CommentRequest;
import com.aniket.devflow.dto.CommentResponse;
import com.aniket.devflow.entity.Comment;
import com.aniket.devflow.entity.Task;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.exception.ResourceNotFoundException;
import com.aniket.devflow.repository.CommentRepository;
import com.aniket.devflow.repository.TaskRepository;
import com.aniket.devflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public CommentResponse createComment(
            Long projectId,
            Long taskId,
            CommentRequest request,
            Long userId) {

        Task task = taskRepository.findByIdAndProjectId(
                        taskId,
                        projectId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Comment comment = Comment.builder()
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .task(task)
                .user(user)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment);
    }

    public List<CommentResponse> getComments(
            Long projectId,
            Long taskId,
            Long userId) {

        taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        return commentRepository
                .findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

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
                comment.getCreatedAt(),
                comment.getTask().getId(),
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
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