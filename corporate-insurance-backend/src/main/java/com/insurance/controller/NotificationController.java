package com.insurance.controller;

import com.insurance.entity.Notification;
import com.insurance.entity.User;
import com.insurance.repository.UserRepository;
import com.insurance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserNotifications(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            List<Notification> notifications = notificationService.getUserNotifications(currentUser.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadNotifications(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            List<Notification> notifications = notificationService.getUnreadNotifications(currentUser.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadNotificationCount(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            long count = notificationService.getUnreadNotificationCount(currentUser.getId());
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            Notification notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllNotificationsAsRead(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            notificationService.markAllAsRead(currentUser.getId());
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/general")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createGeneralNotification(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message) {
        try {
            // This would need to fetch the user and create notification
            // For now, return a placeholder response
            return ResponseEntity.ok("General notification created");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
