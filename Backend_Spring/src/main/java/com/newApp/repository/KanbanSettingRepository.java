package com.newApp.repository;

import com.newApp.entity.KanbanSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KanbanSettingRepository extends JpaRepository<KanbanSetting, Long> {
    Optional<KanbanSetting> findByColumnKey(String columnKey);
}