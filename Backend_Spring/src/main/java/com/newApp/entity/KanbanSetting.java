package com.newApp.entity;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "kanban_settings")
public class KanbanSetting {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @Column(name = "column_key", unique = true, nullable = false)
    private String columnKey;

    @Column(nullable = false)
    private Integer status;     // 1, 2, 6

    @Column(nullable = false)
    private String color;       // "#3b82f6"

    @Column(nullable = false)
    private String icon;        // "🔵"

    // ✅ Relation 1-N avec les traductions
    @OneToMany(
        mappedBy = "kanbanSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    @JsonManagedReference
    private List<KanbanTranslation> translations = new ArrayList<>();

    // ========== GETTERS / SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getColumnKey() { return columnKey; }
    public void setColumnKey(String columnKey) { this.columnKey = columnKey; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public List<KanbanTranslation> getTranslations() { return translations; }
    public void setTranslations(List<KanbanTranslation> translations) { this.translations = translations; }

    // ========== HELPERS ==========
    public void addTranslation(KanbanTranslation translation) {
        translations.add(translation);
        translation.setKanbanSetting(this);
    }
}
