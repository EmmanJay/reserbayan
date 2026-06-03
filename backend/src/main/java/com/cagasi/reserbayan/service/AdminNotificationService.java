package com.cagasi.reserbayan.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cagasi.reserbayan.entity.AdminNotification;
import com.cagasi.reserbayan.entity.DocumentRequest;
import com.cagasi.reserbayan.entity.Resident;
import com.cagasi.reserbayan.entity.ResidentStatus;
import com.cagasi.reserbayan.repository.AdminNotificationRepository;
import com.cagasi.reserbayan.repository.DocumentRequestRepository;
import com.cagasi.reserbayan.repository.ResidentRepository;

@Service
public class AdminNotificationService {

    public static final String CATEGORY_REQUESTS = "REQUESTS";
    public static final String CATEGORY_VERIFICATION = "VERIFICATION";
    public static final String TARGET_DOCUMENT_REQUEST = "DOCUMENT_REQUEST";
    public static final String TARGET_RESIDENT_REQUEST = "RESIDENT_REQUEST";

    @Autowired
    private AdminNotificationRepository adminNotificationRepository;

    @Autowired
    private DocumentRequestRepository documentRequestRepository;

    @Autowired
    private ResidentRepository residentRepository;

    public AdminNotification createNotification(
            String title,
            String message,
            String type,
            String category,
            String targetType,
            Long targetId) {
        return createNotification(title, message, type, category, targetType, targetId, null);
    }

    public AdminNotification createNotification(
            String title,
            String message,
            String type,
            String category,
            String targetType,
            Long targetId,
            String additionalData) {
        AdminNotification notification = new AdminNotification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCategory(category);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        notification.setAdditionalData(additionalData);
        return adminNotificationRepository.save(notification);
    }

    public List<AdminNotification> getNotifications(String category) {
        syncMissingOperationalNotifications();

        if (category == null || category.equalsIgnoreCase("all")) {
            return adminNotificationRepository.findAllByOrderByCreatedAtDesc();
        }

        return adminNotificationRepository.findByCategoryOrderByCreatedAtDesc(category.toUpperCase());
    }

    @Transactional
    public void syncMissingOperationalNotifications() {
        for (DocumentRequest request : documentRequestRepository.findAll()) {
            if (!"pending".equalsIgnoreCase(request.getStatus())) {
                continue;
            }

            boolean exists = adminNotificationRepository.existsByTypeAndTargetTypeAndTargetId(
                    "DOCUMENT_REQUEST_CREATED",
                    TARGET_DOCUMENT_REQUEST,
                    request.getRequestId());

            if (!exists) {
                Resident resident = request.getResident();
                String residentName = resident != null
                        ? resident.getFirstName() + " " + resident.getLastName()
                        : "A resident";

                createNotification(
                        "New Document Request",
                        residentName.trim() + " requested " + request.getDocumentName() + ".",
                        "DOCUMENT_REQUEST_CREATED",
                        CATEGORY_REQUESTS,
                        TARGET_DOCUMENT_REQUEST,
                        request.getRequestId());
            }
        }

        for (Resident resident : residentRepository.findAll()) {
            if (resident.getStatus() != ResidentStatus.PENDING) {
                continue;
            }

            boolean exists = adminNotificationRepository.existsByTypeAndTargetTypeAndTargetId(
                    "ACCOUNT_VERIFICATION_CREATED",
                    TARGET_RESIDENT_REQUEST,
                    resident.getResidentId());

            if (!exists) {
                createNotification(
                        "New Account Verification",
                        resident.getFirstName() + " " + resident.getLastName() + " submitted an account verification request.",
                        "ACCOUNT_VERIFICATION_CREATED",
                        CATEGORY_VERIFICATION,
                        TARGET_RESIDENT_REQUEST,
                        resident.getResidentId());
            }
        }
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        AdminNotification notification = adminNotificationRepository.findById(notificationId).orElse(null);
        if (notification != null && !notification.isRead()) {
            notification.setRead(true);
            adminNotificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead() {
        List<AdminNotification> notifications = adminNotificationRepository.findAll();
        for (AdminNotification notification : notifications) {
            notification.setRead(true);
        }
        adminNotificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        adminNotificationRepository.deleteById(notificationId);
    }

    public void deleteAllNotifications() {
        adminNotificationRepository.deleteAll();
    }
}
