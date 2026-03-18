package com.insurance.controller;

import com.insurance.dto.AvailabilityRequest;
import com.insurance.entity.AgentAvailability;
import com.insurance.entity.User;
import com.insurance.repository.UserRepository;
import com.insurance.service.AgentAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AgentAvailabilityController {

    @Autowired
    private AgentAvailabilityService availabilityService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> createAvailability(@Valid @RequestBody AvailabilityRequest request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "User not found"));
            }
            
            AgentAvailability availability = availabilityService.createAvailability(currentUser.getId(), request);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/agent/{agentId}")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getAgentAvailability(
            @PathVariable Long agentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<AgentAvailability> availabilities = availabilityService.getAgentAvailability(agentId, date);
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/agent/me")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> getMyAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "User not found"));
            }
            
            List<AgentAvailability> availabilities = availabilityService.getAgentAvailability(currentUser.getId(), date);
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<AgentAvailability> availableSlots = availabilityService.getAllAvailableSlots(date);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/agent/{agentId}/available")
    public ResponseEntity<?> getAvailableSlotsForAgent(
            @PathVariable Long agentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<AgentAvailability> availableSlots = availabilityService.getAvailableSlotsForAgent(agentId, date);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PutMapping("/{availabilityId}")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long availabilityId,
            @Valid @RequestBody AvailabilityRequest request,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "User not found"));
            }
            
            AgentAvailability availability = availabilityService.updateAvailability(availabilityId, request, currentUser.getId());
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{availabilityId}")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> deleteAvailability(@PathVariable Long availabilityId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "User not found"));
            }
            
            availabilityService.deleteAvailability(availabilityId, currentUser.getId());
            return ResponseEntity.ok("Availability deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/agent/{agentId}/range")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getAgentAvailabilityInDateRange(
            @PathVariable Long agentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<AgentAvailability> availabilities = availabilityService.getAgentAvailabilityInDateRange(agentId, startDate, endDate);
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAvailabilityInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<AgentAvailability> availabilities = availabilityService.getAllAvailabilityInDateRange(startDate, endDate);
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
