package com.newApp.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cout")
public class Cout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer ticket;

    @Column(nullable = false)
    private Double cout;

    @Column(nullable = false, length = 20)
    private String type = "SAISI";

    // ⭐ Sans @JsonFormat, Spring détecte le format ISO automatiquement
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "item")
    private String item;

    @Column(name = "category")
    private String category;


    // ========== CONSTRUCTEURS ==========
    public Cout() {}

    public Cout(Integer ticket, Double cout) {
        this.ticket = ticket;
        this.cout = cout;
        this.type = "SAISI";
        this.createdAt = LocalDateTime.now();
    }

    public Cout(Integer ticket, Double cout, String type) {
        this.ticket = ticket;
        this.cout = cout;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public Cout(Integer ticket, Double cout, String type, String item, String category) {
        this.ticket = ticket;
        this.cout = cout;
        this.type = type;
        this.item = item;
        this.category = category;
        this.createdAt = LocalDateTime.now();
    }

    // ⭐ Ne génère le timestamp QUE s'il n'a pas été fourni
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (type == null) {
            type = "SAISI";
        }
    }

    // ========== GETTERS / SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTicket() { return ticket; }
    public void setTicket(Integer ticket) { this.ticket = ticket; }

    public Double getCout() { return cout; }
    public void setCout(Double cout) { this.cout = cout; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}