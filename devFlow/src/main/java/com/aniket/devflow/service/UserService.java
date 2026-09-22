package com.aniket.devflow.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aniket.devflow.dto.UpdateProfileRequest;
import com.aniket.devflow.entity.User;
import com.aniket.devflow.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        String hashedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );
    }
    public List<User> findAllUsers() {
    return userRepository.findAll();
}
public User updateProfile(
        String email,
        UpdateProfileRequest request
) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found")
            );

    if (request.name() != null
            && !request.name().isBlank()) {
        user.setName(request.name().trim());
    }

    if (request.role() != null) {
        user.setRole(
                request.role().trim().isEmpty()
                        ? null
                        : request.role().trim()
        );
    }

    if (request.designation() != null) {
        user.setDesignation(
                request.designation().trim().isEmpty()
                        ? null
                        : request.designation().trim()
        );
    }

    if (request.department() != null) {
        user.setDepartment(
                request.department().trim().isEmpty()
                        ? null
                        : request.department().trim()
        );
    }

    if (request.joiningDate() != null) {
        user.setJoiningDate(request.joiningDate());
    }

    if (request.photoUrl() != null) {
        user.setPhotoUrl(
                request.photoUrl().trim().isEmpty()
                        ? null
                        : request.photoUrl().trim()
        );
    }

    return userRepository.save(user);
}
}