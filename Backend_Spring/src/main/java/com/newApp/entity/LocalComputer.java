package com.newapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "local_computers")
public class LocalComputer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID du Computer dans GLPI (peut être null si saisie manuelle) */
    @Column(name = "glpi_computer_id")
    private Long glpiComputerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "serial")
    private String serial;

    /** Note personnelle ajoutée par l'utilisateur */
    @Column(name = "local_note", length = 2000)
    private String localNote;

    /** Tag personnalisé (ex: "perso", "client X") */
    @Column(name = "custom_tag")
    private String customTag;

    /** Priorité interne (1 = faible, 5 = critique) */
    @Column(name = "priority")
    private Integer priority;

    /** Provient d'un import GLPI ou saisi manuellement */
    @Column(name = "imported_from_glpi")
    private Boolean importedFromGlpi = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== LIFECYCLE =====
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== GETTERS / SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGlpiComputerId() { return glpiComputerId; }
    public void setGlpiComputerId(Long glpiComputerId) { this.glpiComputerId = glpiComputerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }

    public String getLocalNote() { return localNote; }
    public void setLocalNote(String localNote) { this.localNote = localNote; }

    public String getCustomTag() { return customTag; }
    public void setCustomTag(String customTag) { this.customTag = customTag; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Boolean getImportedFromGlpi() { return importedFromGlpi; }
    public void setImportedFromGlpi(Boolean importedFromGlpi) { this.importedFromGlpi = importedFromGlpi; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}