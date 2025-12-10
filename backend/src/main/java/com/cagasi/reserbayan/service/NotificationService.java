package com.cagasi.reserbayan.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cagasi.reserbayan.entity.Notification;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Resident resident, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setResident(resident);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByResident(Long residentId) {
        return notificationRepository.findByResident_ResidentIdOrderByCreatedAtDesc(residentId);
    }

    public List<Notification> getUnreadNotificationsByResident(Long residentId) {
        return notificationRepository.findByResident_ResidentIdAndIsReadFalseOrderByCreatedAtDesc(residentId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllAsRead(Long residentId) {
        List<Notification> unreadNotifications = getUnreadNotificationsByResident(residentId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}