package com.aniket.devflow.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey key;

    private final long expirationTime = 1000 * 60 * 60;
public JwtService(
        @Value("${DEVFLOW_JWT_SECRET:DevFlowLocalDevelopmentSecretKey2026}") String secretKey
) {
        this.key = Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email) {

        Date now = new Date();

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(
                        new Date(now.getTime() + expirationTime)
                )
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}