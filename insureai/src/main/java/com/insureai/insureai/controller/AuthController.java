package com.insureai.insureai.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.insureai.insureai.model.User;
import com.insureai.insureai.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Signup
    @PostMapping("/signup")
    public String signup(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            return "User already exists";
        }
        User user = new User();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        userRepository.save(user);
        return "Signup successful";
    }

    // Login
    @PostMapping("/login")
    public String login(@RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) return "User not found";
        if (!user.getPassword().equals(request.getPassword())) return "Invalid password";
        return "Login successful for " + user.getRole();
    }

    // For testing: list all users
    @GetMapping("/all-users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}