package com.aniket.devflow.controller;

import com.aniket.devflow.dto.NotificationResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.NotificationService;
import com.aniket.devflow.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(
            NotificationService notificationService,
            UserService userService) {

        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            Authentication authentication) {

        User user = userService.findUserByEmail(
                authentication.getName());

        List<NotificationResponse> notifications =
                notificationService.getNotifications(user.getId());

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication) {

        User user = userService.findUserByEmail(
                authentication.getName());

        long count = notificationService.getUnreadCount(
                user.getId());

        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        User user = userService.findUserByEmail(
                authentication.getName());

        NotificationResponse response =
                notificationService.markAsRead(
                        notificationId,
                        user.getId());

        return ResponseEntity.ok(response);
    }
}