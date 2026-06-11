package com.newApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class LocalComputerDto {

    private Long glpiComputerId;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String serial;
    private String localNote;
    private String customTag;

    @Min(value = 1, message = "Priorité min = 1")
    @Max(value = 20, message = "Priorité max = 20")
    private Integer priority;

    private Boolean importedFromGlpi = false;

    // ===== GETTERS / SETTERS =====
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
}