package com.newApp.service;


import com.newApp.entity.KanbanSetting;
import com.newApp.entity.KanbanTranslation;
import com.newApp.entity.Language;
import com.newApp.repository.KanbanSettingRepository;
import com.newApp.repository.LanguageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KanbanSettingService {

    @Autowired
    private KanbanSettingRepository settingRepo;

    @Autowired
    private LanguageRepository languageRepo;

    /**
     * Initialise les langues + colonnes Kanban par défaut
     */
    @PostConstruct
    @Transactional
    public void initDefaults() {
        // === Langues ===
        if (languageRepo.count() == 0) {
            createLanguage("fr", "Français", "🇫🇷", true, true);
            createLanguage("mg", "Malagasy", "🇲🇬", true, false);
            createLanguage("en", "English", "🇬🇧", false, false);
            System.out.println("✅ Langues initialisées");
        }

        // === Colonnes Kanban ===
        if (settingRepo.count() == 0) {
            createColumn("new", 1, "#3b82f6", "🔵",
                new String[][]{{"fr", "New"}, {"mg", "Vaovao"}, {"en", "New"}});

            createColumn("progress", 2, "#f59e0b", "🟠",
                new String[][]{{"fr", "In progress"}, {"mg", "Manao izao"}, {"en", "In progress"}});

            createColumn("done", 6, "#10b981", "🟢",
                new String[][]{{"fr", "Closed"}, {"mg", "Vita"}, {"en", "Done"}});

            System.out.println("✅ Kanban settings initialisés");
        }
    }

    private void createLanguage(String code, String name, String flag, boolean active, boolean isDefault) {
        Language l = new Language();
        l.setCode(code);
        l.setName(name);
        l.setFlag(flag);
        l.setIsActive(active);
        l.setIsDefault(isDefault);
        languageRepo.save(l);
    }

    private void createColumn(String key, Integer status, String color, String icon, String[][] translations) {
        KanbanSetting s = new KanbanSetting();
        s.setColumnKey(key);
        s.setStatus(status);
        s.setColor(color);
        s.setIcon(icon);

        for (String[] t : translations) {
            KanbanTranslation tr = new KanbanTranslation(t[0], t[1]);
            s.addTranslation(tr);
        }

        settingRepo.save(s);
    }

    public List<KanbanSetting> getAll() {
        return settingRepo.findAll();
    }

    public List<Language> getActiveLanguages() {
        return languageRepo.findByIsActiveTrue();
    }

    @Transactional
    public KanbanSetting update(Long id, KanbanSetting updated) {
        KanbanSetting existing = settingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + id));

        existing.setColor(updated.getColor());
        existing.setIcon(updated.getIcon());

        // Update translations
        existing.getTranslations().clear();
        for (KanbanTranslation t : updated.getTranslations()) {
            KanbanTranslation copy = new KanbanTranslation(t.getLanguageCode(), t.getLabel());
            existing.addTranslation(copy);
        }

        return settingRepo.save(existing);
    }

    @Transactional
    public void resetToDefaults() {
        settingRepo.deleteAll();
        languageRepo.deleteAll();
        initDefaults();
    }
}