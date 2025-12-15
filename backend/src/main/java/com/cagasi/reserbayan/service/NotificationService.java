package com.cagasi.reserbayan.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cagasi.reserbayan.entity.Notification;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Resident resident, String title, String message, String type) {
        return createNotification(resident, title, message, type, null);
    }

    public Notification createNotification(Resident resident, String title, String message, String type, String additionalData) {
        Notification notification = new Notification();
        notification.setResident(resident);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setAdditionalData(additionalData);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByResident(Long residentId) {
        return notificationRepository.findByResident_ResidentIdOrderByCreatedAtDesc(residentId);
    }

    public List<Notification> getUnreadNotificationsByResident(Long residentId) {
        return notificationRepository.findByResident_ResidentIdAndIsReadEqualsOrderByCreatedAtDesc(residentId, 0);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        System.out.println("=== MARK AS READ START ===");
        System.out.println("Marking notification as read: " + notificationId);
        
        // Check integrity before making changes
        checkNotificationIntegrity(notificationId);
        
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            System.out.println("Found notification: " + notification.getNotificationId() + ", current isRead: " + notification.isRead());
            
            // Store original state for comparison
            boolean originalReadStatus = notification.isRead();
            
            if (!notification.isRead()) {
                System.out.println("Setting isRead to true...");
                notification.setRead(true);
                
                System.out.println("Calling repository.save()...");
                Notification saved = notificationRepository.save(notification);
                
                System.out.println("After save - notification isRead: " + saved.isRead());
                System.out.println("After save - notification ID: " + saved.getNotificationId());
                
                // Verify the change was persisted in database
                verifyNotificationReadStatus(notificationId);
                
                System.out.println("Notification marked as read and saved successfully");
            } else {
                System.out.println("Notification was already read, no changes needed");
            }
        } else {
            System.out.println("ERROR: Notification not found with ID: " + notificationId);
        }
        
        System.out.println("=== MARK AS READ END ===");
    }

    public void markAllAsRead(Long residentId) {
        List<Notification> unreadNotifications = getUnreadNotificationsByResident(residentId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
    
    // Verification method to check database state directly
    public boolean verifyNotificationReadStatus(Long notificationId) {
        Notification freshNotification = notificationRepository.findById(notificationId).orElse(null);
        if (freshNotification != null) {
            System.out.println("VERIFICATION: Notification " + notificationId + " isRead = " + freshNotification.isRead() + " in database");
            return freshNotification.isRead();
        } else {
            System.out.println("VERIFICATION: Notification " + notificationId + " not found in database");
            return false;
        }
    }
    
    // Check for database integrity issues
    public void checkNotificationIntegrity(Long notificationId) {
        System.out.println("=== CHECKING NOTIFICATION INTEGRITY ===");
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            System.out.println("Notification ID: " + notification.getNotificationId());
            System.out.println("Current isRead: " + notification.isRead());
            System.out.println("Title: " + notification.getTitle());
            System.out.println("Message: " + notification.getMessage());
            System.out.println("Created At: " + notification.getCreatedAt());
            
            // Check if there are multiple notifications with the same ID (should not happen)
            long count = notificationRepository.count();
            System.out.println("Total notifications in database: " + count);
        }
        System.out.println("=== INTEGRITY CHECK END ===");
    }
}