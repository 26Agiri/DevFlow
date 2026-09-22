package com.aniket.devflow.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aniket.devflow.dto.WeeklyWorkHistoryResponse;
import com.aniket.devflow.dto.WorkSessionHistoryResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.entity.WorkSession;
import com.aniket.devflow.repository.WorkSessionRepository;

@Service
public class WorkSessionService {

    private static final long DAILY_TARGET_SECONDS = 7 * 60 * 60;
    private static final long WEEKLY_TARGET_SECONDS = 35 * 60 * 60;

    private static final long PAUSE_GRACE_SECONDS = 7 * 60;

    private static final long FIRST_WARNING_SECONDS = 15 * 60 * 60;
    private static final long STRICT_WARNING_SECONDS = 10 * 60 * 60;

    private final WorkSessionRepository workSessionRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public WorkSessionService(
            WorkSessionRepository workSessionRepository,
            UserService userService,
            NotificationService notificationService
    ) {
        this.workSessionRepository = workSessionRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public WorkSession startSession(String email) {

        User user = getUser(email);

        if (!isWorkingDay(LocalDate.now())) {
            throw new IllegalStateException(
                    "Work sessions are not available on weekends"
            );
        }

        var existingSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (existingSession.isPresent()) {
            throw new IllegalStateException(
                    "A work session is already active"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        WorkSession session = WorkSession.builder()
                .user(user)
                .startedAt(now)
                .lastHeartbeatAt(now)
                .durationSeconds(0)
                .status(WorkSession.Status.ACTIVE)
                .build();

        return workSessionRepository.save(session);
    }

    public WorkSession startSessionIfNotActive(String email) {

        User user = getUser(email);

        if (!isWorkingDay(LocalDate.now())) {
            return null;
        }

        var existingSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (existingSession.isPresent()) {
            return existingSession.get();
        }

        LocalDateTime now = LocalDateTime.now();

        WorkSession session = WorkSession.builder()
                .user(user)
                .startedAt(now)
                .lastHeartbeatAt(now)
                .durationSeconds(0)
                .status(WorkSession.Status.ACTIVE)
                .build();

        return workSessionRepository.save(session);
    }

    public WorkSession pauseSession(String email) {

        User user = getUser(email);

        WorkSession session = getActiveSession(user);

        LocalDateTime now = LocalDateTime.now();

        long elapsedSeconds =
                Duration.between(
                        session.getStartedAt(),
                        now
                ).getSeconds();

        session.setDurationSeconds(
                session.getDurationSeconds() + elapsedSeconds
        );

        session.setPausedAt(now);
        session.setLastHeartbeatAt(now);
        session.setStatus(WorkSession.Status.PAUSED);

        return workSessionRepository.save(session);
    }

    public WorkSession resumeSession(String email) {

        User user = getUser(email);

        WorkSession pausedSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.PAUSED
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No paused work session found"
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime pausedAt =
                pausedSession.getPausedAt();

        if (pausedAt == null) {
            pausedAt = now;
        }

        long pausedSeconds =
                Duration.between(
                        pausedAt,
                        now
                ).getSeconds();

        // Pause window expired
        if (pausedSeconds >= PAUSE_GRACE_SECONDS) {

            pausedSession.setEndedAt(
                    pausedAt.plusSeconds(
                            PAUSE_GRACE_SECONDS
                    )
            );

            pausedSession.setEndedReason(
                    "PAUSE_EXPIRED"
            );

            pausedSession.setStatus(
                    WorkSession.Status.COMPLETED
            );

            workSessionRepository.save(pausedSession);

            throw new IllegalStateException(
                    "Your 7-minute pause window has expired. You no longer have access to the workspace."
            );
        }

        // If resume happens on another day,
        // finish the previous session and start a new one.
        if (!pausedSession.getStartedAt()
                .toLocalDate()
                .equals(now.toLocalDate())) {

            pausedSession.setEndedAt(now);

            pausedSession.setEndedReason("PAUSE_EXPIRED");

            pausedSession.setStatus(
                    WorkSession.Status.COMPLETED
            );

            workSessionRepository.save(pausedSession);

            WorkSession newSession =
                    WorkSession.builder()
                            .user(user)
                            .startedAt(now)
                            .lastHeartbeatAt(now)
                            .durationSeconds(0)
                            .status(
                                    WorkSession.Status.ACTIVE
                            )
                            .build();

            return workSessionRepository.save(
                    newSession
            );
        }

        // Same-day resume
        pausedSession.setStartedAt(now);
        pausedSession.setPausedAt(null);
        pausedSession.setLastHeartbeatAt(now);
        pausedSession.setStatus(
                WorkSession.Status.ACTIVE
        );

        return workSessionRepository.save(
                pausedSession
        );
    }

    public WorkSession stopSession(String email) {

        User user = getUser(email);

        WorkSession session =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        )
                        .orElseGet(() ->
                                workSessionRepository
                                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                                user.getId(),
                                                WorkSession.Status.PAUSED
                                        )
                                        .orElseThrow(() ->
                                                new IllegalStateException(
                                                        "No active or paused work session found"
                                                )
                                        )
                        );

        if (session.getStatus()
                == WorkSession.Status.ACTIVE) {

            long elapsedSeconds =
                    Duration.between(
                            session.getStartedAt(),
                            LocalDateTime.now()
                    ).getSeconds();

            session.setDurationSeconds(
                    session.getDurationSeconds()
                            + elapsedSeconds
            );
        }

        session.setEndedAt(LocalDateTime.now());
        session.setEndedReason("LOGOUT");
        session.setStatus(
                WorkSession.Status.COMPLETED
        );

        return workSessionRepository.save(
                session
        );
    }

    public long getTodayWorkedSeconds(String email) {

        User user = getUser(email);

        LocalDate today = LocalDate.now();

        LocalDateTime start =
                LocalDateTime.of(
                        today,
                        LocalTime.MIN
                );

        LocalDateTime end =
                LocalDateTime.of(
                        today,
                        LocalTime.MAX
                );

        List<WorkSession> sessions =
                workSessionRepository
                        .findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(
                                user.getId(),
                                start,
                                end
                        );

        long total =
                sessions.stream()
                        .mapToLong(
                                WorkSession::getDurationSeconds
                        )
                        .sum();

        var activeSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (activeSession.isPresent()) {

            WorkSession session =
                    activeSession.get();

            if (session.getStartedAt()
                    .toLocalDate()
                    .equals(today)) {

                long activeSeconds =
                        Duration.between(
                                session.getStartedAt(),
                                LocalDateTime.now()
                        ).getSeconds();

                total += activeSeconds;
            }
        }

        return Math.max(total, 0);
    }

    public long getRemainingTodaySeconds(
            String email
    ) {

        long workedSeconds =
                getTodayWorkedSeconds(email);

        return Math.max(
                DAILY_TARGET_SECONDS - workedSeconds,
                0
        );
    }

    public boolean isActive(String email) {

        User user = getUser(email);

        var activeSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (activeSession.isEmpty()) {
            return false;
        }

        return activeSession.get()
                .getStartedAt()
                .toLocalDate()
                .equals(LocalDate.now());
    }

    private WorkSession getActiveSession(User user) {

        return workSessionRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                        user.getId(),
                        WorkSession.Status.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No active work session found"
                        )
                );
    }

    private User getUser(String email) {
        return userService.findUserByEmail(email);
    }

    public long getActiveSessionSeconds(
            String email
    ) {

        User user = getUser(email);

        var activeSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (activeSession.isEmpty()) {
            return 0;
        }

        WorkSession session =
                activeSession.get();

        LocalDateTime now =
                LocalDateTime.now();

        if (!session.getStartedAt()
                .toLocalDate()
                .equals(now.toLocalDate())) {
            return 0;
        }

        return Duration.between(
                session.getStartedAt(),
                now
        ).getSeconds();
    }

    public long getThisWeekWorkedSeconds(
            String email
    ) {

        User user = getUser(email);

        LocalDate today =
                LocalDate.now();

        LocalDate monday =
                today.with(DayOfWeek.MONDAY);

        LocalDate nextMonday =
                monday.plusDays(7);

        LocalDateTime start =
                monday.atStartOfDay();

        LocalDateTime end =
                nextMonday.atStartOfDay();

        List<WorkSession> sessions =
                workSessionRepository
                        .findByUserIdAndStartedAtBetween(
                                user.getId(),
                                start,
                                end
                        );

        long total =
                sessions.stream()
                        .mapToLong(
                                WorkSession::getDurationSeconds
                        )
                        .sum();

        var activeSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (activeSession.isPresent()) {

            WorkSession session =
                    activeSession.get();

            LocalDateTime now =
                    LocalDateTime.now();

            if (session.getStartedAt()
                    .toLocalDate()
                    .equals(now.toLocalDate())) {

                long activeSeconds =
                        Duration.between(
                                session.getStartedAt(),
                                now
                        ).getSeconds();

                total += activeSeconds;
            }
        }

        return Math.min(
                total,
                WEEKLY_TARGET_SECONDS
        );
    }

    public long getThisWeekRemainingSeconds(
            String email
    ) {

        long workedSeconds =
                getThisWeekWorkedSeconds(email);

        return Math.max(
                WEEKLY_TARGET_SECONDS - workedSeconds,
                0
        );
    }

    public int getWorkingDaysRemaining() {

        LocalDate today =
                LocalDate.now();

        int remainingDays = 0;

        LocalDate date = today;

        while (date.getDayOfWeek()
                != DayOfWeek.SUNDAY) {

            if (date.getDayOfWeek()
                    != DayOfWeek.SATURDAY) {

                remainingDays++;
            }

            date = date.plusDays(1);
        }

        return remainingDays;
    }

    public String getWeeklyWarningLevel(
            String email
    ) {

        long remainingSeconds =
                getThisWeekRemainingSeconds(
                        email
                );

        if (!isWorkingDay(LocalDate.now())) {
            return "NORMAL";
        }

        if (remainingSeconds == 0) {
            return "COMPLETED";
        }

        int workingDaysRemaining =
                getWorkingDaysRemaining();

        if (workingDaysRemaining <= 1
                && remainingSeconds
                >= STRICT_WARNING_SECONDS) {

            return "STRICT";
        }

        if (workingDaysRemaining <= 2
                && remainingSeconds
                >= FIRST_WARNING_SECONDS) {

            return "WARNING";
        }

        return "NORMAL";
    }

 @Scheduled(fixedRate = 60_000)
@Transactional
public void closeStaleWorkSessions() {

    LocalDateTime now = LocalDateTime.now();

    List<WorkSession> sessions =
            workSessionRepository.findAll();

    for (WorkSession session : sessions) {

        if (session.getStatus() != WorkSession.Status.ACTIVE) {
            continue;
        }

        LocalDateTime lastHeartbeat =
                session.getLastHeartbeatAt();

        if (lastHeartbeat == null) {
            continue;
        }

        long inactiveSeconds =
                Duration.between(
                        lastHeartbeat,
                        now
                ).getSeconds();

        if (inactiveSeconds >= 5 * 60) {

            long elapsedSeconds =
                    Duration.between(
                            session.getStartedAt(),
                            lastHeartbeat
                    ).getSeconds();

            session.setDurationSeconds(
                    Math.max(elapsedSeconds, 0)
            );

            session.setEndedAt(lastHeartbeat);

            session.setEndedReason(
                    "HEARTBEAT_TIMEOUT"
            );

            session.setStatus(
                    WorkSession.Status.COMPLETED
            );

            workSessionRepository.save(session);
        }
    }
}

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void closeSessionsAtMidnight() {

        LocalDateTime now =
                LocalDateTime.now();

        workSessionRepository.findAll().stream()
                .filter(session ->
                        session.getStatus()
                                == WorkSession.Status.ACTIVE
                )
                .filter(session ->
                        session.getStartedAt()
                                .toLocalDate()
                                .isBefore(
                                        now.toLocalDate()
                                )
                )
                .forEach(session -> {

                    LocalDateTime midnight =
                            session.getStartedAt()
                                    .toLocalDate()
                                    .plusDays(1)
                                    .atStartOfDay();

                    long elapsedSeconds =
                            Duration.between(
                                    session.getStartedAt(),
                                    midnight
                            ).getSeconds();

                    session.setDurationSeconds(
                            session.getDurationSeconds()
                                    + elapsedSeconds
                    );

                    session.setEndedAt(midnight);
                    session.setEndedReason(
                            "MIDNIGHT"
                    );

                    session.setStatus(
                            WorkSession.Status.COMPLETED
                    );

                    workSessionRepository.save(
                            session
                    );
                });
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void checkWeeklyWorkAlerts() {

        userService.findAllUsers().forEach(user -> {

            String warningLevel =
                    getWeeklyWarningLevel(
                            user.getEmail()
                    );

            if ("WARNING".equals(warningLevel)) {

                createWeeklyNotificationIfNeeded(
                        user,
                        "WARNING",
                        "Weekly work target warning. You have 15+ hours remaining with only 2 working days left."
                );

            } else if ("STRICT"
                    .equals(warningLevel)) {

                createWeeklyNotificationIfNeeded(
                        user,
                        "STRICT",
                        "Weekly work target at risk. You have 10+ hours remaining on the last working day."
                );

            } else if ("COMPLETED"
                    .equals(warningLevel)) {

                createWeeklyNotificationIfNeeded(
                        user,
                        "COMPLETED",
                        "Weekly work target completed. You've completed your 35-hour work target for this week."
                );
            }
        });
    }

    private void createWeeklyNotificationIfNeeded(
            User user,
            String level,
            String message
    ) {

        LocalDate today =
                LocalDate.now();

        LocalDate monday =
                today.with(DayOfWeek.MONDAY);

        LocalDate nextMonday =
                monday.plusDays(7);

        LocalDateTime start =
                monday.atStartOfDay();

        LocalDateTime end =
                nextMonday.atStartOfDay();

        String uniqueMessage =
                "[" + level + "] " + message;

        boolean alreadyNotified =
                notificationService.hasWeeklyNotification(
                        user.getId(),
                        uniqueMessage,
                        start,
                        end
                );

        if (alreadyNotified) {
            return;
        }

        notificationService.createNotification(
                user.getId(),
                uniqueMessage
        );
    }

    public WorkSession updateHeartbeat(
            String email
    ) {

        User user = getUser(email);

        WorkSession session =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No active work session found"
                                )
                        );

        session.setLastHeartbeatAt(
                LocalDateTime.now()
        );

        return workSessionRepository.save(
                session
        );
    }



    public List<WorkSessionHistoryResponse>
    getSessionHistoryForWeek(
            String email,
            LocalDate weekStart
    ) {

        User user = getUser(email);

        LocalDateTime start =
                weekStart.atStartOfDay();

        LocalDateTime end =
                weekStart.plusDays(7)
                        .atStartOfDay()
                        .minusNanos(1);

        List<WorkSession> sessions =
                workSessionRepository
                        .findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(
                                user.getId(),
                                start,
                                end
                        );

        return sessions.stream()
                .map(session -> {

                    long durationSeconds =
                            session.getDurationSeconds();

                    if (session.getStatus()
                            == WorkSession.Status.ACTIVE) {

                        long activeSeconds =
                                Duration.between(
                                        session.getStartedAt(),
                                        LocalDateTime.now()
                                ).getSeconds();

                        durationSeconds += Math.max(
                                activeSeconds,
                                0
                        );
                    }

                    return new WorkSessionHistoryResponse(
                            session.getId(),
                            session.getStartedAt()
                                    .toLocalDate()
                                    .toString(),
                            session.getStartedAt()
                                    .toString(),
                            session.getEndedAt() != null
                                    ? session.getEndedAt()
                                            .toString()
                                    : null,
                            durationSeconds,
                            session.getStatus()
                                    .name()
                    );
                })
                .toList();
    }

    public List<WeeklyWorkHistoryResponse>
    getWeeklyWorkHistory(
            String email
    ) {

        User user = getUser(email);

        LocalDate currentWeekStart =
                LocalDate.now()
                        .with(DayOfWeek.MONDAY);

        List<WeeklyWorkHistoryResponse> history =
                new java.util.ArrayList<>();

        for (int i = 0; i < 12; i++) {

            LocalDate weekStart =
                    currentWeekStart.minusWeeks(i);

            LocalDate weekEnd =
                    weekStart.plusDays(6);

            LocalDateTime start =
                    weekStart.atStartOfDay();

            LocalDateTime endExclusive =
                    weekEnd.plusDays(1)
                            .atStartOfDay();

            List<WorkSession> sessions =
                    workSessionRepository
                            .findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(
                                    user.getId(),
                                    start,
                                    endExclusive
                                            .minusNanos(1)
                            );

            long workedSeconds =
                    sessions.stream()
                            .mapToLong(
                                    WorkSession::getDurationSeconds
                            )
                            .sum();

            if (i == 0) {

                var activeSession =
                        workSessionRepository
                                .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                        user.getId(),
                                        WorkSession.Status.ACTIVE
                                );

                if (activeSession.isPresent()) {

                    WorkSession session =
                            activeSession.get();

                    LocalDateTime now =
                            LocalDateTime.now();

                    LocalDateTime activeStart =
                            session.getStartedAt()
                                    .isBefore(start)
                                    ? start
                                    : session.getStartedAt();

                    if (activeStart.isBefore(now)
                            && now.isBefore(
                                    endExclusive
                            )) {

                        long activeSeconds =
                                Duration.between(
                                        activeStart,
                                        now
                                ).getSeconds();

                        workedSeconds += activeSeconds;
                    }
                }
            }

            long remainingSeconds =
                    Math.max(
                            WEEKLY_TARGET_SECONDS
                                    - workedSeconds,
                            0
                    );

            double progressPercentage =
                    Math.min(
                            ((double) workedSeconds
                                    / WEEKLY_TARGET_SECONDS)
                                    * 100.0,
                            100.0
                    );

            boolean completed =
                    workedSeconds
                            >= WEEKLY_TARGET_SECONDS;

            history.add(
                    new WeeklyWorkHistoryResponse(
                            weekStart.toString(),
                            weekEnd.toString(),
                            WEEKLY_TARGET_SECONDS,
                            workedSeconds,
                            remainingSeconds,
                            progressPercentage,
                            completed
                    )
            );
        }

        return history;
    }

    public String getCurrentSessionStatus(
            String email
    ) {

        User user = getUser(email);

        var activeSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.ACTIVE
                        );

        if (activeSession.isPresent()) {
            return "ACTIVE";
        }

        var pausedSession =
                workSessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                                user.getId(),
                                WorkSession.Status.PAUSED
                        );

        if (pausedSession.isPresent()) {
            return "PAUSED";
        }

        return "INACTIVE";
    }

    private boolean isWorkingDay(
            LocalDate date
    ) {

        return date.getDayOfWeek()
                != DayOfWeek.SATURDAY
                && date.getDayOfWeek()
                != DayOfWeek.SUNDAY;
    }
    public boolean hadHeartbeatTimeout(String email) {

    User user = getUser(email);

    return workSessionRepository
            .findFirstByUserIdAndStatusOrderByStartedAtDesc(
                    user.getId(),
                    WorkSession.Status.COMPLETED
            )
            .map(session ->
                    "HEARTBEAT_TIMEOUT".equals(
                            session.getEndedReason()
                    )
            )
            .orElse(false);
}

}