package com.insurance.service;

import com.insurance.dto.AvailabilityRequest;
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
public class AgentAvailabilityService {

    @Autowired
    private AgentAvailabilityRepository availabilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public AgentAvailability createAvailability(Long agentId, AvailabilityRequest request) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!agent.getRole().equals(User.Role.AGENT)) {
            throw new RuntimeException("User is not an agent");
        }

        // Validate time range
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Check for overlapping slots
        List<AgentAvailability> overlappingSlots = availabilityRepository
                .findOverlappingSlots(agentId, request.getAvailableDate(), 
                                     request.getStartTime(), request.getEndTime());

        if (!overlappingSlots.isEmpty()) {
            throw new RuntimeException("Time slot overlaps with existing availability");
        }

        AgentAvailability availability = new AgentAvailability();
        availability.setAgent(agent);
        availability.setAvailableDate(request.getAvailableDate());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setIsBooked(false);

        return availabilityRepository.save(availability);
    }

    public List<AgentAvailability> getAgentAvailability(Long agentId, LocalDate date) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        List<AgentAvailability> availabilities = availabilityRepository.findByAgentAndAvailableDate(agent, date);
        
        // For each availability, check if it has an appointment and include appointment details
        for (AgentAvailability availability : availabilities) {
            if (availability.getIsBooked()) {
                // Find the appointment for this availability slot
                List<Appointment> appointments = appointmentRepository.findByAgentIdAndAppointmentDateAndTimeRange(
                    agentId, date, availability.getStartTime(), availability.getEndTime());
                
                if (!appointments.isEmpty()) {
                    // Set appointment details in availability
                    Appointment appointment = appointments.get(0);
                    availability.setAppointmentDetails(appointment);
                }
            }
        }
        
        return availabilities;
    }

    public List<AgentAvailability> getAllAvailableSlots(LocalDate date) {
        return availabilityRepository.findAllAvailableSlots(date, LocalDate.now());
    }

    public List<AgentAvailability> getAvailableSlotsForAgent(Long agentId, LocalDate date) {
        return availabilityRepository.findAvailableSlotsForAgent(agentId, date, LocalDate.now());
    }

    public AgentAvailability updateAvailability(Long availabilityId, AvailabilityRequest request, Long agentId) {
        AgentAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        // Check if the availability belongs to the agent
        if (!availability.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("You can only update your own availability");
        }

        // Check if the slot is already booked
        if (availability.getIsBooked()) {
            throw new RuntimeException("Cannot update a booked time slot");
        }

        // Validate time range
        if (request.getStartTime().isAfter(request.getEndTime()) || 
            request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Check for overlapping slots (excluding current slot)
        List<AgentAvailability> overlappingSlots = availabilityRepository
                .findOverlappingSlots(agentId, request.getAvailableDate(), 
                                     request.getStartTime(), request.getEndTime())
                .stream()
                .filter(slot -> !slot.getId().equals(availabilityId))
                .collect(Collectors.toList());

        if (!overlappingSlots.isEmpty()) {
            throw new RuntimeException("Time slot overlaps with existing availability");
        }

        availability.setAvailableDate(request.getAvailableDate());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());

        return availabilityRepository.save(availability);
    }

    public void deleteAvailability(Long availabilityId, Long agentId) {
        AgentAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        // Check if the availability belongs to the agent
        if (!availability.getAgent().getId().equals(agentId)) {
            throw new RuntimeException("You can only delete your own availability");
        }

        // Check if the slot is already booked
        if (availability.getIsBooked()) {
            throw new RuntimeException("Cannot delete a booked time slot");
        }

        availabilityRepository.delete(availability);
    }

    public List<AgentAvailability> getAgentAvailabilityInDateRange(Long agentId, LocalDate startDate, LocalDate endDate) {
        return availabilityRepository.findAvailableSlotsInDateRange(startDate, endDate)
                .stream()
                .filter(slot -> slot.getAgent().getId().equals(agentId))
                .collect(Collectors.toList());
    }

    public List<AgentAvailability> getAllAvailabilityInDateRange(LocalDate startDate, LocalDate endDate) {
        return availabilityRepository.findAvailableSlotsInDateRange(startDate, endDate);
    }
}
