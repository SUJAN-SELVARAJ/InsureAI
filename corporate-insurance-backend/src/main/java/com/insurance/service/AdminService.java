package com.insurance.service;

import com.insurance.entity.*;
import com.insurance.repository.*;
import com.insurance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private InsurancePlanRepository planRepository;

    @Autowired
    private AgentAvailabilityRepository availabilityRepository;

    @Autowired
    private CustomerPlanRepository customerPlanRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getDashboardStatistics(Long adminId) {
        Map<String, Object> stats = new HashMap<>();

        // User statistics
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalAgents = userRepository.countByRole(User.Role.AGENT);
        long totalAdmins = userRepository.countByRole(User.Role.ADMIN);

        // Appointment statistics
        long totalAppointments = appointmentRepository.count();
        long scheduledAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.SCHEDULED);
        long completedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);
        long todayAppointments = appointmentRepository.countScheduledAppointmentsByDate(LocalDate.now());

        // Plan statistics
        long totalPlans = planRepository.count();
        long activePlans = planRepository.count();

        // Availability statistics
        long totalAvailabilities = availabilityRepository.count();

        stats.put("users", Map.of(
            "total", totalUsers,
            "customers", totalCustomers,
            "agents", totalAgents,
            "admins", totalAdmins
        ));

        stats.put("appointments", Map.of(
            "total", totalAppointments,
            "scheduled", scheduledAppointments,
            "completed", completedAppointments,
            "cancelled", cancelledAppointments,
            "today", todayAppointments
        ));

        stats.put("plans", Map.of(
            "total", totalPlans,
            "active", activePlans
        ));

        stats.put("availabilities", Map.of(
            "total", totalAvailabilities
        ));

        return stats;
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Page<User> getUsersByRole(User.Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPlainPassword("Password@123");
            user.setPassword(passwordEncoder.encode("Password@123"));
        } else {
            user.setPlainPassword(user.getPassword());
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User updateUser(Long userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.getEnabled());

        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
    }

    public Page<Appointment> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable);
    }

    public List<Appointment> getAppointmentsInDateRange(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findAppointmentsInDateRange(startDate, endDate);
    }

    public Page<InsurancePlan> getAllPlans(Pageable pageable) {
        return planRepository.findAll(pageable);
    }

    public InsurancePlan createPlan(InsurancePlan plan) {
        return planRepository.save(plan);
    }

    public InsurancePlan updatePlan(Long planId, InsurancePlan planDetails) {
        InsurancePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setPlanName(planDetails.getPlanName());
        plan.setPlanType(planDetails.getPlanType());
        plan.setDescription(planDetails.getDescription());
        plan.setCoverageAmount(planDetails.getCoverageAmount());
        plan.setPremiumAmount(planDetails.getPremiumAmount());
        plan.setDurationMonths(planDetails.getDurationMonths());
        plan.setIsActive(planDetails.getIsActive());

        return planRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        InsurancePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        planRepository.delete(plan);
    }

    public List<AgentAvailability> getAllAvailabilities() {
        return availabilityRepository.findAll();
    }

    public List<AgentAvailability> getAvailabilitiesInDateRange(LocalDate startDate, LocalDate endDate) {
        return availabilityRepository.findAvailableSlotsInDateRange(startDate, endDate);
    }

    public List<CustomerPlan> getAllCustomerPlans() {
        return customerPlanRepository.findAll();
    }

    public List<CustomerPlan> getExpiringPlans(int daysBeforeExpiry) {
        LocalDate expiryDate = LocalDate.now().plusDays(daysBeforeExpiry);
        return customerPlanRepository.findAll().stream()
                .filter(plan -> plan.getEndDate().isEqual(expiryDate) && plan.isActive())
                .collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Long> getAppointmentStatsByMonth() {
        // This would require implementing custom queries in the repository
        // For now, return empty map
        return new HashMap<>();
    }

    public Map<String, Long> getPlanSubscriptionStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("HEALTH", planRepository.countActivePlansByType(InsurancePlan.PlanType.HEALTH));
        stats.put("LIFE", planRepository.countActivePlansByType(InsurancePlan.PlanType.LIFE));
        stats.put("PROPERTY", planRepository.countActivePlansByType(InsurancePlan.PlanType.PROPERTY));
        stats.put("LIABILITY", planRepository.countActivePlansByType(InsurancePlan.PlanType.LIABILITY));
        stats.put("VEHICLE", planRepository.countActivePlansByType(InsurancePlan.PlanType.VEHICLE));
        return stats;
    }
}
