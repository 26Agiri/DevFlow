package com.aniket.devflow.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.WeeklyWorkHistoryResponse;
import com.aniket.devflow.dto.WorkSessionHistoryResponse;
import com.aniket.devflow.service.WorkSessionService;

@RestController
@RequestMapping("/api/work-history")
public class WeeklyWorkHistoryController {

    private final WorkSessionService workSessionService;

    public WeeklyWorkHistoryController(
            WorkSessionService workSessionService
    ) {
        this.workSessionService = workSessionService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<WeeklyWorkHistoryResponse>> getWeeklyHistory(
            Authentication authentication
    ) {

        List<WeeklyWorkHistoryResponse> history =
                workSessionService.getWeeklyWorkHistory(
                        authentication.getName()
                );

        return ResponseEntity.ok(history);
    }

    @GetMapping("/weekly/{weekStart}/sessions")
    public ResponseEntity<List<WorkSessionHistoryResponse>> getWeekSessions(
            @PathVariable LocalDate weekStart,
            Authentication authentication
    ) {

        List<WorkSessionHistoryResponse> sessions =
                workSessionService.getSessionHistoryForWeek(
                        authentication.getName(),
                        weekStart
                );

        return ResponseEntity.ok(sessions);
    }
}