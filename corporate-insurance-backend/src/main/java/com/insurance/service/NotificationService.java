package com.insurance.service;

import com.insurance.entity.Notification;
import com.insurance.entity.User;
import com.insurance.repository.NotificationRepository;
import com.insurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    public Notification createNotification(User user, Notification.NotificationType type, String title, String message) {
        try {
            Notification notification = new Notification(user, type, title, message);
            Notification savedNotification = notificationRepository.save(notification);
            
            // Temporarily disable email sending to isolate the issue
            // sendNotificationEmail(savedNotification);
            
            return savedNotification;
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create notification: " + e.getMessage());
        }
    }

    @Async
    public void sendNotificationEmail(Notification notification) {
        try {
            switch (notification.getType()) {
                case APPOINTMENT_BOOKED:
                    emailService.sendAppointmentConfirmation(notification.getUser(), notification.getMessage());
                    break;
                case APPOINTMENT_CANCELLED:
                    emailService.sendAppointmentCancellation(notification.getUser(), notification.getMessage());
                    break;
                case APPOINTMENT_REMINDER:
                    emailService.sendAppointmentReminder(notification.getUser(), notification.getMessage());
                    break;
                case PLAN_EXPIRY:
                    emailService.sendPlanExpiryReminder(notification.getUser(), notification.getMessage());
                    break;
                case GENERAL:
                    emailService.sendGeneralNotification(notification.getUser(), notification.getTitle(), notification.getMessage());
                    break;
            }
            
            // Mark email as sent
            notification.setEmailSent(true);
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Failed to send notification email: " + e.getMessage());
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(
            userRepository.findById(userId).orElse(null)
        );
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadNotificationsByUser(userId);
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadNotificationsByUser(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Send appointment reminders (scheduled task)
    @Scheduled(cron = "0 0 9 * * ?") // Run daily at 9 AM
    public void sendAppointmentReminders() {
        // This would integrate with appointment service to find upcoming appointments
        // For now, it's a placeholder for the scheduled task
        System.out.println("Running appointment reminder task...");
    }

    // Send plan expiry reminders (scheduled task)
    @Scheduled(cron = "0 0 10 * * ?") // Run daily at 10 AM
    public void sendPlanExpiryReminders() {
        // This would integrate with customer plan service to find expiring plans
        // For now, it's a placeholder for the scheduled task
        System.out.println("Running plan expiry reminder task...");
    }

    // Clean up old notifications (scheduled task)
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(6);
        // Delete notifications older than 6 months
        // This would require implementing a custom query in the repository
        System.out.println("Cleaning up old notifications...");
    }

    // Create appointment booking notification
    public void createAppointmentBookingNotification(User user, String appointmentDetails) {
        String title = "Appointment Booked Successfully";
        String message = String.format(
            "Your appointment has been scheduled successfully.\n\n%s\n\nPlease arrive on time for your appointment.",
            appointmentDetails
        );
        createNotification(user, Notification.NotificationType.APPOINTMENT_BOOKED, title, message);
    }

    // Create appointment cancellation notification
    public void createAppointmentCancellationNotification(User user, String appointmentDetails) {
        String title = "Appointment Cancelled";
        String message = String.format(
            "Your appointment has been cancelled.\n\n%s\n\nIf you did not request this cancellation, please contact us.",
            appointmentDetails
        );
        createNotification(user, Notification.NotificationType.APPOINTMENT_CANCELLED, title, message);
    }

    // Create appointment reminder notification
    public void createAppointmentReminderNotification(User user, String appointmentDetails) {
        String title = "Appointment Reminder";
        String message = String.format(
            "This is a reminder about your upcoming appointment.\n\n%s\n\nPlease make sure to arrive on time.",
            appointmentDetails
        );
        createNotification(user, Notification.NotificationType.APPOINTMENT_REMINDER, title, message);
    }

    // Create plan expiry notification
    public void createPlanExpiryNotification(User user, String planDetails) {
        String title = "Insurance Plan Expiry Reminder";
        String message = String.format(
            "Your insurance plan is expiring soon.\n\n%s\n\nPlease renew your plan to continue coverage.",
            planDetails
        );
        createNotification(user, Notification.NotificationType.PLAN_EXPIRY, title, message);
    }

    // Create general notification
    public void createGeneralNotification(User user, String title, String message) {
        createNotification(user, Notification.NotificationType.GENERAL, title, message);
    }
}
