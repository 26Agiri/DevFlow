package com.aniket.devflow.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aniket.devflow.dto.LoginRequest;
import com.aniket.devflow.dto.LoginResponse;

import com.aniket.devflow.dto.RegisterRequest;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

  @PostMapping("/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    LoginResponse response = authService.login(request);
    return ResponseEntity.ok(response);
}

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        User user = authService.register(
                request.name(),
                request.email(),
                request.password()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Account created successfully"
                )
        );
    }
}