package com.aniket.devflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.DashboardResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.DashboardService;
import com.aniket.devflow.service.UserService;
import com.aniket.devflow.service.WorkspaceAccessService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final WorkspaceAccessService workspaceAccessService;

    public DashboardController(
            DashboardService dashboardService,
            UserService userService,
            WorkspaceAccessService workspaceAccessService
    ) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication
    ) {
        String email = authentication.getName();

        workspaceAccessService.requireActiveSession(email);

        User user = userService.findUserByEmail(email);

        DashboardResponse response =
                dashboardService.getDashboardStats(user.getId());

        return ResponseEntity.ok(response);
    }
}