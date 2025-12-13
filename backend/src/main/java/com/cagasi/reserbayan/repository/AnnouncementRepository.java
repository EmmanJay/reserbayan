package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // Get all active announcements ordered by creation date (newest first)
    List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

    // Get all announcements (including inactive ones) ordered by creation date
    // (newest first)
    List<Announcement> findAllByOrderByCreatedAtDesc();

    // Count active announcements
    @Query("SELECT COUNT(a) FROM Announcement a WHERE a.isActive = true")
    Long countActiveAnnouncements();
}