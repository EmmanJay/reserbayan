package com.cagasi.reserbayan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cagasi.reserbayan.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByResident_ResidentIdOrderByCreatedAtDesc(Long residentId);
    List<Notification> findByResident_ResidentIdAndIsReadEqualsOrderByCreatedAtDesc(Long residentId, Integer isRead);
}