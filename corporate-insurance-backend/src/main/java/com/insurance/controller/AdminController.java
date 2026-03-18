package com.insurance.controller;

import com.insurance.entity.*;
import com.insurance.service.AdminService;
import com.insurance.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuthService authService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStatistics() {
        try {
            User currentUser = authService.getCurrentUser();
            Map<String, Object> stats = adminService.getDashboardStatistics(currentUser.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // User Management
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users;
            
            if (role != null && !role.isEmpty()) {
                User.Role userRole = User.Role.valueOf(role.toUpperCase());
                users = adminService.getUsersByRole(userRole, pageable);
            } else {
                users = adminService.getAllUsers(pageable);
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = adminService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody User userDetails) {
        try {
            User updatedUser = adminService.updateUser(userId, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/users/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            adminService.toggleUserStatus(userId);
            return ResponseEntity.ok("User status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Appointment Management
    @GetMapping("/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Appointment> appointments = adminService.getAllAppointments(pageable);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/appointments/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAppointmentsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Appointment> appointments = adminService.getAppointmentsInDateRange(startDate, endDate);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Plan Management
    @GetMapping("/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<InsurancePlan> plans = adminService.getAllPlans(pageable);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPlan(@RequestBody InsurancePlan plan) {
        try {
            InsurancePlan createdPlan = adminService.createPlan(plan);
            return ResponseEntity.ok(createdPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/plans/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePlan(@PathVariable Long planId, @RequestBody InsurancePlan planDetails) {
        try {
            InsurancePlan updatedPlan = adminService.updatePlan(planId, planDetails);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/plans/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        try {
            adminService.deletePlan(planId);
            return ResponseEntity.ok("Plan deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Availability Management
    @GetMapping("/availabilities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAvailabilities() {
        try {
            List<AgentAvailability> availabilities = adminService.getAllAvailabilities();
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/availabilities/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAvailabilitiesInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<AgentAvailability> availabilities = adminService.getAvailabilitiesInDateRange(startDate, endDate);
            return ResponseEntity.ok(availabilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Customer Plans Management
    @GetMapping("/customer-plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomerPlans() {
        try {
            List<CustomerPlan> customerPlans = adminService.getAllCustomerPlans();
            return ResponseEntity.ok(customerPlans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/customer-plans/expiring")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getExpiringPlans(@RequestParam(defaultValue = "30") int daysBeforeExpiry) {
        try {
            List<CustomerPlan> expiringPlans = adminService.getExpiringPlans(daysBeforeExpiry);
            return ResponseEntity.ok(expiringPlans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Statistics
    @GetMapping("/stats/appointments/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAppointmentStatsByMonth() {
        try {
            Map<String, Long> stats = adminService.getAppointmentStatsByMonth();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/stats/plans/subscriptions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPlanSubscriptionStats() {
        try {
            Map<String, Long> stats = adminService.getPlanSubscriptionStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
