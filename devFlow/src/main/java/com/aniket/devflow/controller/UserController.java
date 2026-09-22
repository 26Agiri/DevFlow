package com.aniket.devflow.controller;

import com.aniket.devflow.dto.UserRequest;
import com.aniket.devflow.dto.UserResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @jakarta.validation.Valid @RequestBody UserRequest request
    ) {

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .build();

        User savedUser = userService.createUser(user);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(
            @PathVariable String email
    ) {

        return userService.findByEmail(email)
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}