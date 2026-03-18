package com.insurance.repository;

import com.insurance.entity.Appointment;
import com.insurance.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    @EntityGraph(attributePaths = {"customer", "agent", "availability"})
    List<Appointment> findByCustomer(User customer);
    
    @EntityGraph(attributePaths = {"customer", "agent", "availability"})
    List<Appointment> findByAgent(User agent);
    
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    
    long countByStatus(Appointment.AppointmentStatus status);
    
    @EntityGraph(attributePaths = {"customer", "agent", "availability"})
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId AND a.appointmentDate >= :currentDate ORDER BY a.appointmentDate")
    List<Appointment> findUpcomingAppointmentsForCustomer(@Param("customerId") Long customerId, @Param("currentDate") LocalDate currentDate);
    
    @EntityGraph(attributePaths = {"customer", "agent", "availability"})
    @Query("SELECT a FROM Appointment a WHERE a.agent.id = :agentId AND a.appointmentDate >= :currentDate ORDER BY a.appointmentDate")
    List<Appointment> findUpcomingAppointmentsForAgent(@Param("agentId") Long agentId, @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date")
    List<Appointment> findByAppointmentDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date")
    long countScheduledAppointmentsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a WHERE a.agent.id = :agentId AND a.appointmentDate = :date AND " +
           "((a.startTime <= :startTime AND a.endTime > :startTime) OR " +
           "(a.startTime < :endTime AND a.endTime >= :endTime) OR " +
           "(a.startTime >= :startTime AND a.endTime <= :endTime))")
    List<Appointment> findConflictingAppointments(@Param("agentId") Long agentId, 
                                                  @Param("date") LocalDate date,
                                                  @Param("startTime") LocalTime startTime, 
                                                  @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.agent.id = :agentId AND a.appointmentDate = :date AND " +
           "((a.startTime <= :startTime AND a.endTime > :startTime) OR " +
           "(a.startTime < :endTime AND a.endTime >= :endTime) OR " +
           "(a.startTime >= :startTime AND a.endTime <= :endTime))")
    List<Appointment> findByAgentIdAndAppointmentDateAndTimeRange(@Param("agentId") Long agentId,
                                                               @Param("date") LocalDate date,
                                                               @Param("startTime") LocalTime startTime, 
                                                               @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findAppointmentsInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
