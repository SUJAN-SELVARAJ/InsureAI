package com.insurance.service;

import com.insurance.dto.AppointmentRequest;
import com.insurance.entity.AgentAvailability;
import com.insurance.entity.Appointment;
import com.insurance.entity.User;
import com.insurance.repository.AgentAvailabilityRepository;
import com.insurance.repository.AppointmentRepository;
import com.insurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentAvailabilityRepository availabilityRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    public Appointment createAppointment(Long customerId, AppointmentRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        User agent = userRepository.findById(request.getAgentId())
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!agent.getRole().equals(User.Role.AGENT)) {
            throw new RuntimeException("Selected user is not an agent");
        }

        AgentAvailability availability = availabilityRepository.findById(request.getAvailabilityId())
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        // Check if the availability belongs to the selected agent
        if (!availability.getAgent().getId().equals(request.getAgentId())) {
            throw new RuntimeException("Availability slot does not belong to the selected agent");
        }

        // Check if the availability is already booked
        if (availability.getIsBooked()) {
            throw new RuntimeException("This time slot is already booked");
        }

        // Check for conflicting appointments
        List<Appointment> conflictingAppointments = appointmentRepository
                .findConflictingAppointments(request.getAgentId(), request.getAppointmentDate(),
                                           request.getStartTime(), request.getEndTime());

        if (!conflictingAppointments.isEmpty()) {
            throw new RuntimeException("Agent already has an appointment during this time");
        }

        // Create the appointment
        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setAgent(agent);
        appointment.setAvailability(availability);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Mark the availability as booked
        availability.setIsBooked(true);
        availabilityRepository.save(availability);

        // Send confirmation emails and notifications
        try {
            String appointmentDetails = buildAppointmentDetails(savedAppointment);
            emailService.sendAppointmentConfirmation(customer, appointmentDetails);
            emailService.sendAppointmentConfirmation(agent, appointmentDetails);
            
            notificationService.createAppointmentBookingNotification(agent, appointmentDetails);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send appointment confirmation notifications: " + e.getMessage());
        }

        return savedAppointment;
    }

    public List<Appointment> getCustomerAppointments(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return appointmentRepository.findByCustomer(customer);
    }

    public List<Appointment> getAgentAppointments(Long agentId) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return appointmentRepository.findByAgent(agent);
    }

    public List<Appointment> getUpcomingAppointmentsForCustomer(Long customerId) {
        return appointmentRepository.findUpcomingAppointmentsForCustomer(customerId, LocalDate.now());
    }

    public List<Appointment> getUpcomingAppointmentsForAgent(Long agentId) {
        return appointmentRepository.findUpcomingAppointmentsForAgent(agentId, LocalDate.now());
    }

    public Appointment updateAppointmentStatus(Long appointmentId, Appointment.AppointmentStatus status, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if the user has permission to update this appointment
        if (!appointment.getCustomer().getId().equals(userId) && 
            !appointment.getAgent().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this appointment");
        }

        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // If appointment is cancelled, free up the availability slot
        if (status == Appointment.AppointmentStatus.CANCELLED) {
            AgentAvailability availability = appointment.getAvailability();
            availability.setIsBooked(false);
            availabilityRepository.save(availability);

            // Send cancellation emails and notifications
            try {
                String appointmentDetails = buildAppointmentDetails(appointment);
                emailService.sendAppointmentCancellation(appointment.getCustomer(), appointmentDetails);
                emailService.sendAppointmentCancellation(appointment.getAgent(), appointmentDetails);
                
                notificationService.createAppointmentCancellationNotification(appointment.getAgent(), appointmentDetails);
            } catch (Exception e) {
                System.err.println("Warning: Failed to send appointment cancellation notifications: " + e.getMessage());
            }
        }

        return updatedAppointment;
    }

    public void deleteAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if the user has permission to delete this appointment
        if (!appointment.getCustomer().getId().equals(userId) && 
            !appointment.getAgent().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this appointment");
        }

        // Free up the availability slot
        AgentAvailability availability = appointment.getAvailability();
        availability.setIsBooked(false);
        availabilityRepository.save(availability);

        appointmentRepository.delete(appointment);
    }

    public List<Appointment> getAppointmentsInDateRange(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findAppointmentsInDateRange(startDate, endDate);
    }

    private String buildAppointmentDetails(Appointment appointment) {
        return String.format(
            "Date: %s\nTime: %s - %s\nAgent: %s %s\nCustomer: %s %s\nNotes: %s",
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getAgent().getFirstName(),
            appointment.getAgent().getLastName(),
            appointment.getCustomer().getFirstName(),
            appointment.getCustomer().getLastName(),
            appointment.getNotes() != null ? appointment.getNotes() : "No notes"
        );
    }
}
