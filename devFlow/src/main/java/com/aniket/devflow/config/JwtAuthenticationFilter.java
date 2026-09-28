package com.aniket.devflow.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.aniket.devflow.service.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        System.out.println("JWT FILTER -> " + request.getMethod() + " " + path);
        System.out.println("JWT AUTH HEADER PRESENT -> " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT FILTER -> No Bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractEmail(token);

            System.out.println("JWT FILTER -> Extracted email: " + email);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                AuthorityUtils.NO_AUTHORITIES
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println("JWT FILTER -> AUTHENTICATED: " + email);
            }

        } catch (JwtException | IllegalArgumentException e) {

            System.out.println("JWT FILTER -> INVALID TOKEN: " + e.getMessage());

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}