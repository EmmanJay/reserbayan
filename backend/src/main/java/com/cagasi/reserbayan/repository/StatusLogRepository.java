package com.cagasi.reserbayan.repository;

import com.cagasi.reserbayan.entity.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusLogRepository extends JpaRepository<StatusLog, Long> {
}