package com.cagasi.reserbayan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cagasi.reserbayan.entity.AdminNotification;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findAllByOrderByCreatedAtDesc();
    List<AdminNotification> findByCategoryOrderByCreatedAtDesc(String category);
    boolean existsByTypeAndTargetTypeAndTargetId(String type, String targetType, Long targetId);
}
