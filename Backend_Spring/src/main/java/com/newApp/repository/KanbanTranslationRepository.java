package com.newApp.repository;

import com.newApp.entity.KanbanTranslation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KanbanTranslationRepository extends JpaRepository<KanbanTranslation, Long> {
    List<KanbanTranslation> findByKanbanSettingId(Long settingId);
}
