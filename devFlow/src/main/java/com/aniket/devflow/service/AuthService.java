package com.aniket.devflow.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aniket.devflow.dto.LoginRequest;
import com.aniket.devflow.dto.LoginResponse;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WorkSessionService workSessionService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            WorkSessionService workSessionService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.workSessionService = workSessionService;
    }

  public LoginResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    boolean passwordMatches =
            passwordEncoder.matches(request.password(), user.getPassword());

    if (!passwordMatches) {
        throw new IllegalArgumentException("Invalid email or password");
    }

    boolean heartbeatTimeout =
            workSessionService.hadHeartbeatTimeout(user.getEmail());

    workSessionService.startSessionIfNotActive(user.getEmail());

    String token = jwtService.generateToken(user.getEmail());

    return new LoginResponse(token, heartbeatTimeout);
}

    public User register(
            String name,
            String email,
            String password
    ) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        User user = User.builder()
                .name(name.trim())
                .email(email.trim().toLowerCase())
                .password(passwordEncoder.encode(password))
                .build();

        return userRepository.save(user);
    }
}