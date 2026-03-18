package com.insurance.controller;

import com.insurance.entity.User;
import com.insurance.entity.CustomerPlan;
import com.insurance.entity.InsurancePlan;
import com.insurance.repository.AppointmentRepository;
import com.insurance.repository.CustomerPlanRepository;
import com.insurance.repository.InsurancePlanRepository;
import com.insurance.repository.NotificationRepository;
import com.insurance.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;
import com.insurance.repository.UserRepository;

import java.util.List;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerPlanRepository customerPlanRepository;

    @Autowired
    private InsurancePlanRepository insurancePlanRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuthService authService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            User currentUser = authService.getCurrentUser();
            Long customerId = currentUser.getId();
            LocalDate today = LocalDate.now();

            long upcomingAppointments = appointmentRepository.findUpcomingAppointmentsForCustomer(customerId, today).size();
            long activePlans = customerPlanRepository.findActivePlansByCustomer(customerId).size();
            long unreadNotifications = notificationRepository.countUnreadNotificationsByUser(customerId);

            Map<String, Object> stats = new HashMap<>();
            stats.put("upcomingAppointments", upcomingAppointments);
            stats.put("activePlans", activePlans);
            stats.put("unreadNotifications", unreadNotifications);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/agents")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getAllAgents() {
        try {
            List<User> agents = userRepository.findByRole(User.Role.AGENT, Pageable.unpaged()).getContent();
            return ResponseEntity.ok(agents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/plans/{planId}/opt-in")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> optInToPlan(@PathVariable Long planId) {
        try {
            User currentUser = authService.getCurrentUser();
            
            InsurancePlan plan = insurancePlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
                
            boolean alreadyOptedIn = customerPlanRepository.findActivePlansByCustomer(currentUser.getId())
                .stream()
                .anyMatch(cp -> cp.getPlan().getId().equals(planId));
                
            if (alreadyOptedIn) {
                return ResponseEntity.badRequest().body("Error: Already opted in to this plan");
            }

            String policyNumber = "POL-" + currentUser.getId() + "-" + System.currentTimeMillis();
            LocalDate startDate = LocalDate.now();
            LocalDate endDate = startDate.plusMonths(plan.getDurationMonths());

            CustomerPlan customerPlan = new CustomerPlan(
                currentUser, plan, policyNumber, startDate, endDate, plan.getPremiumAmount()
            );

            CustomerPlan savedPlan = customerPlanRepository.save(customerPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/plans")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyPlans() {
        try {
            User currentUser = authService.getCurrentUser();
            List<CustomerPlan> myPlans = customerPlanRepository.findActivePlansByCustomer(currentUser.getId());
            return ResponseEntity.ok(myPlans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
