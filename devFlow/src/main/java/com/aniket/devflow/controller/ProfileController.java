package com.aniket.devflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aniket.devflow.dto.UpdateProfileRequest;
import com.aniket.devflow.dto.UserProfileResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(
            Authentication authentication
    ) {

        User user =
                userService.findUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                toProfileResponse(user)
        );
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {

        User updatedUser =
                userService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                toProfileResponse(updatedUser)
        );
    }

    private UserProfileResponse toProfileResponse(User user) {

        String employeeId =
                String.format(
                        "DF-%04d",
                        user.getId()
                );

        return new UserProfileResponse(
                user.getId(),
                employeeId,
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDesignation(),
                user.getDepartment(),
                user.getJoiningDate(),
                user.getPhotoUrl()
        );
    }
}