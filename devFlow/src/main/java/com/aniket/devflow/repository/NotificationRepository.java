package com.aniket.devflow.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aniket.devflow.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    long countByUserIdAndIsReadFalse(
            Long userId
    );
    boolean existsByUserIdAndMessageAndCreatedAtBetween(
        Long userId,
        String message,
        LocalDateTime start,
        LocalDateTime end
);
}