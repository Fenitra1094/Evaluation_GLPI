package com.newApp.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(
    name = "kanban_translations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"kanban_setting_id", "language_code"})
)
public class KanbanTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanban_setting_id", nullable = false)
    @JsonBackReference
    private KanbanSetting kanbanSetting;

    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode;   // "fr", "mg", "en", "es"...

    @Column(nullable = false)
    private String label;          // "Nouveau", "Vaovao", "New", "Nuevo"...

    // ========== CONSTRUCTORS ==========
    public KanbanTranslation() {}

    public KanbanTranslation(String languageCode, String label) {
        this.languageCode = languageCode;
        this.label = label;
    }

    // ========== GETTERS / SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public KanbanSetting getKanbanSetting() { return kanbanSetting; }
    public void setKanbanSetting(KanbanSetting kanbanSetting) { this.kanbanSetting = kanbanSetting; }

    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    
}
