package com.newApp.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "languages")
public class Language {

    @Id
    @Column(length = 5)
    private String code;        // "fr", "mg", "en"

    @Column(nullable = false)
    private String name;        // "Français", "Malagasy", "English"

    @Column(nullable = false)
    private String flag;        // "🇫🇷", "🇲🇬", "🇬🇧"

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    // ========== GETTERS / SETTERS ==========
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFlag() { return flag; }
    public void setFlag(String flag) { this.flag = flag; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}