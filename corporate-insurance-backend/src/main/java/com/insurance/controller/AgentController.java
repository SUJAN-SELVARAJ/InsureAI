package com.insurance.controller;

import com.insurance.entity.Appointment;
import com.insurance.entity.User;
import com.insurance.repository.AgentAvailabilityRepository;
import com.insurance.repository.AppointmentRepository;
import com.insurance.service.AuthService;
import com.insurance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AgentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AgentAvailabilityRepository agentAvailabilityRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            User currentUser = authService.getCurrentUser();
            Long agentId = currentUser.getId();
            LocalDate today = LocalDate.now();

            long upcomingAppointments = appointmentRepository.findUpcomingAppointmentsForAgent(agentId, today).size();
            long todayAvailability = agentAvailabilityRepository.countSlotsForAgentOnDate(agentId, today);
            
            List<Appointment> appointments = appointmentRepository.findByAgent(currentUser);
            long totalCustomers = appointments.stream().map(a -> a.getCustomer().getId()).distinct().count();

            long unreadNotifications = notificationService.getUnreadNotificationCount(agentId);

            Map<String, Object> stats = new HashMap<>();
            stats.put("upcomingAppointments", upcomingAppointments);
            stats.put("todayAvailability", todayAvailability);
            stats.put("totalCustomers", totalCustomers);
            stats.put("unreadNotifications", unreadNotifications);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
