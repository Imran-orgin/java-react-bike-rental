package com.imran.bike_rental_api.service;

import com.imran.bike_rental_api.dto.AuthResponse;
import com.imran.bike_rental_api.dto.LoginRequest;
import com.imran.bike_rental_api.dto.RegisterRequest;
import com.imran.bike_rental_api.exception.InvalidCredentialsException;
import com.imran.bike_rental_api.model.User;
import com.imran.bike_rental_api.repository.UserRepository;
import com.imran.bike_rental_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setFullName(req.fullName().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole("USER");
        userRepository.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }
}