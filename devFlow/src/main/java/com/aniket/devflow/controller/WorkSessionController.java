package com.aniket.devflow.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.WeeklyWorkHistoryResponse;
import com.aniket.devflow.dto.WorkSessionHistoryResponse;
import com.aniket.devflow.entity.WorkSession;
import com.aniket.devflow.service.WorkSessionService;

@RestController
@RequestMapping("/api/work-sessions")
public class WorkSessionController {

    private final WorkSessionService workSessionService;

    public WorkSessionController(
            WorkSessionService workSessionService
    ) {
        this.workSessionService = workSessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<WorkSession> startSession(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workSessionService.startSession(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/pause")
    public ResponseEntity<WorkSession> pauseSession(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workSessionService.pauseSession(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/resume")
    public ResponseEntity<WorkSession> resumeSession(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workSessionService.resumeSession(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/stop")
    public ResponseEntity<WorkSession> stopSession(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workSessionService.stopSession(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<WorkSession> heartbeat(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                workSessionService.updateHeartbeat(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            Authentication authentication
    ) {

        String email = authentication.getName();

        long activeSessionSeconds =
                workSessionService.getActiveSessionSeconds(email);

        long workedSeconds =
                workSessionService.getTodayWorkedSeconds(email);

        long remainingSeconds =
                workSessionService.getRemainingTodaySeconds(email);

        long weeklyWorkedSeconds =
                workSessionService.getThisWeekWorkedSeconds(email);

        long weeklyRemainingSeconds =
                workSessionService.getThisWeekRemainingSeconds(email);

        int workingDaysRemaining =
                workSessionService.getWorkingDaysRemaining();

        String weeklyWarningLevel =
                workSessionService.getWeeklyWarningLevel(email);

        String sessionStatus =
                workSessionService.getCurrentSessionStatus(email);

        return ResponseEntity.ok(
                Map.ofEntries(
                        Map.entry(
                                "active",
                                workSessionService.isActive(email)
                        ),

                        Map.entry(
                                "activeSessionSeconds",
                                activeSessionSeconds
                        ),

                        Map.entry(
                                "workedSeconds",
                                workedSeconds
                        ),

                        Map.entry(
                                "remainingSeconds",
                                remainingSeconds
                        ),

                        Map.entry(
                                "dailyTargetSeconds",
                                7 * 60 * 60
                        ),

                        Map.entry(
                                "weeklyWorkedSeconds",
                                weeklyWorkedSeconds
                        ),

                        Map.entry(
                                "weeklyRemainingSeconds",
                                weeklyRemainingSeconds
                        ),

                        Map.entry(
                                "weeklyTargetSeconds",
                                35 * 60 * 60
                        ),

                        Map.entry(
                                "workingDaysRemaining",
                                workingDaysRemaining
                        ),

                        Map.entry(
                                "weeklyWarningLevel",
                                weeklyWarningLevel
                        ),

                        Map.entry(
                                "sessionStatus",
                                sessionStatus
                        )
                )
        );
    }

    // =========================================================
    // WEEKLY WORK HISTORY
    // =========================================================

    @GetMapping("/history/weekly")
    public ResponseEntity<List<WeeklyWorkHistoryResponse>>
    getWeeklyHistory(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                workSessionService.getWeeklyWorkHistory(
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // SESSION HISTORY FOR SELECTED WEEK
    // =========================================================

    @GetMapping("/history/sessions")
    public ResponseEntity<List<WorkSessionHistoryResponse>>
    getSessionHistory(
            Authentication authentication,
            @RequestParam LocalDate weekStart
    ) {

        return ResponseEntity.ok(
                workSessionService.getSessionHistoryForWeek(
                        authentication.getName(),
                        weekStart
                )
        );
    }
}