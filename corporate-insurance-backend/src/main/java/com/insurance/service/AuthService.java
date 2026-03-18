package com.insurance.service;

import com.insurance.dto.AuthResponse;
import com.insurance.dto.LoginRequest;
import com.insurance.dto.RegisterRequest;
import com.insurance.entity.User;
import com.insurance.repository.UserRepository;
import com.insurance.security.CustomUserDetailsService.UserPrincipal;
import com.insurance.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getUsername());

        return new AuthResponse(
            jwt,
            refreshToken,
            userPrincipal.getId(),
            userPrincipal.getUsername(),
            userPrincipal.getFirstName(),
            userPrincipal.getLastName(),
            userPrincipal.getRole().name(),
            userPrincipal.isEmailVerified()
        );
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPlainPassword(registerRequest.getPassword());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setRole(User.Role.valueOf(registerRequest.getRole().toUpperCase()));
        user.setEnabled(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Send verification email
        try {
            var emailToken = tokenService.createEmailVerificationToken(savedUser);
            emailService.sendVerificationEmail(savedUser, emailToken.getToken());
        } catch (Exception e) {
            System.err.println("Warning: Failed to send verification email: " + e.getMessage());
        }

        // Auto-login after registration
        LoginRequest loginRequest = new LoginRequest(registerRequest.getEmail(), registerRequest.getPassword());
        return login(loginRequest);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            String username = tokenProvider.getUsernameFromJWT(refreshToken);
            User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            String newAccessToken = tokenProvider.generateTokenFromUsername(username);
            String newRefreshToken = tokenProvider.generateRefreshToken(username);

            return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getEmailVerified()
            );
        } else {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("User not authenticated");
    }

    public boolean verifyEmail(String token) {
        return tokenService.verifyEmail(token);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        var resetToken = tokenService.createPasswordResetToken(user);
        emailService.sendPasswordResetEmail(user, resetToken.getToken());
    }

    public void resetPassword(String token, String newPassword) {
        User user = tokenService.validatePasswordResetToken(token);
        if (user == null) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        tokenService.deletePasswordResetToken(token);
    }
}
