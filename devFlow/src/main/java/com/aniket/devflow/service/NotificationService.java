package com.aniket.devflow.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.aniket.devflow.dto.NotificationResponse;
import com.aniket.devflow.entity.Notification;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.exception.ResourceNotFoundException;
import com.aniket.devflow.repository.NotificationRepository;
import com.aniket.devflow.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponse createNotification(
            Long userId,
            String message
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Notification notification = Notification.builder()
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    public List<NotificationResponse> getNotifications(
            Long userId
    ) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository
                .countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markAsRead(
            Long notificationId,
            Long userId
    ) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Notification not found"
                        )
                );

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You can update only your own notification"
            );
        }

        notification.setRead(true);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return mapToResponse(updatedNotification);
    }

    public boolean hasDailyTargetNotificationToday(Long userId) {

        String targetMessage =
                "Daily work target completed. You've completed your 7-hour work target for today.";

        LocalDate today = LocalDate.now();

        LocalDateTime start =
                LocalDateTime.of(today, LocalTime.MIN);

        LocalDateTime end =
                LocalDateTime.of(today, LocalTime.MAX);

        return notificationRepository
                .existsByUserIdAndMessageAndCreatedAtBetween(
                        userId,
                        targetMessage,
                        start,
                        end
                );
    }
    public boolean hasWeeklyNotification(
        Long userId,
        String message,
        LocalDateTime start,
        LocalDateTime end
) {
    return notificationRepository
            .existsByUserIdAndMessageAndCreatedAtBetween(
                    userId,
                    message,
                    start,
                    end
            );
}

    private NotificationResponse mapToResponse(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}