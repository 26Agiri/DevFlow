package com.aniket.devflow.service;

import org.springframework.stereotype.Service;

@Service
public class WorkspaceAccessService {

    private final WorkSessionService workSessionService;

    public WorkspaceAccessService(
            WorkSessionService workSessionService
    ) {
        this.workSessionService = workSessionService;
    }

    public void requireActiveSession(String email) {

        String status =
                workSessionService.getCurrentSessionStatus(email);

        if (!"ACTIVE".equals(status)) {
            throw new IllegalStateException(
                    "Workspace is locked. An active work session is required."
            );
        }
    }
 
}