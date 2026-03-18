package com.insurance.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRequest {
    
    @NotNull(message = "Agent ID is required")
    private Long agentId;
    
    @NotNull(message = "Availability ID is required")
    private Long availabilityId;
    
    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be in the future or present")    
    private LocalDate appointmentDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    public AppointmentRequest() {}

    public AppointmentRequest(Long agentId, Long availabilityId, LocalDate appointmentDate, 
                           LocalTime startTime, LocalTime endTime, String notes) {
        this.agentId = agentId;
        this.availabilityId = availabilityId;
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Long getAvailabilityId() { return availabilityId; }
    public void setAvailabilityId(Long availabilityId) { this.availabilityId = availabilityId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
