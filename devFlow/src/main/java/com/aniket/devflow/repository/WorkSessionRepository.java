package com.aniket.devflow.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aniket.devflow.entity.WorkSession;

public interface WorkSessionRepository extends JpaRepository<WorkSession, Long> {

    Optional<WorkSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(
            Long userId,
            WorkSession.Status status
    );

    List<WorkSession> findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<WorkSession> findByUserIdAndStartedAtBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
}