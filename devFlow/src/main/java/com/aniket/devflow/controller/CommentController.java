package com.aniket.devflow.controller;

import java.util.List;

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

import com.aniket.devflow.dto.CommentRequest;
import com.aniket.devflow.dto.CommentResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.CommentService;
import com.aniket.devflow.service.UserService;
import com.aniket.devflow.service.WorkspaceAccessService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;
    private final WorkspaceAccessService workspaceAccessService;

    public CommentController(
            CommentService commentService,
            UserService userService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.commentService = commentService;
        this.userService = userService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        CommentResponse response = commentService.createComment(
                projectId,
                taskId,
                request,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        List<CommentResponse> comments = commentService.getComments(
                projectId,
                taskId,
                user.getId()
        );

        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        commentService.deleteComment(
                projectId,
                taskId,
                commentId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        CommentResponse response = commentService.updateComment(
                projectId,
                taskId,
                commentId,
                request,
                user.getId()
        );

        return ResponseEntity.ok(response);
    }
}