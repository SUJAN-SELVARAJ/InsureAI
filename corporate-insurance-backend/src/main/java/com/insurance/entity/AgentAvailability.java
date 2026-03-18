package com.insurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "agent_availability")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AgentAvailability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Agent is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    @JsonIgnoreProperties({"password", "availabilities", "agentAppointments", "customerAppointments", "notifications"})
    private User agent;
    
    @NotNull(message = "Available date is required")
    @Column(name = "available_date")
    private LocalDate availableDate;
    
    @NotNull(message = "Start time is required")
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Column(name = "is_booked")
    private Boolean isBooked = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Transient field for appointment details (not stored in database)
    @Transient
    private Appointment appointmentDetails;
    
    @JsonIgnore
    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public AgentAvailability() {}
    
    public AgentAvailability(User agent, LocalDate availableDate, LocalTime startTime, LocalTime endTime) {
        this.agent = agent;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getAgent() { return agent; }
    public void setAgent(User agent) { this.agent = agent; }
    
    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    
    public Boolean getIsBooked() { return isBooked; }
    public void setIsBooked(Boolean isBooked) { this.isBooked = isBooked; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Appointment getAppointmentDetails() { return appointmentDetails; }
    public void setAppointmentDetails(Appointment appointmentDetails) { this.appointmentDetails = appointmentDetails; }
}
