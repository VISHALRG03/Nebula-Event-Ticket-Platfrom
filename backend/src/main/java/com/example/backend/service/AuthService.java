package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.EmailAlreadyExistException;
import com.example.backend.exception.InvalidPasswordException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Wrong password");
        }

        // ✅ Make sure role is included in token
        String token = jwtService.createToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()  // This should be "TICKET_CHECKER"
        );

        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(token, userDTO);
    }


    public AuthResponse register(RegisterRequest registerRequest) {

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());

        // Encrypt password
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        // Set role
        try {
            user.setRole(Role.valueOf(registerRequest.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            user.setRole(Role.USER); // Default to USER if invalid
        }

        // Save user
        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.createToken (
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name());

        // Create user DTO
        UserDTO userDTO = new UserDTO (
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name());

        return new AuthResponse(token, userDTO);
    }
}
