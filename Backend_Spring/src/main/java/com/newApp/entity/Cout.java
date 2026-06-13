package com.newApp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cout")
public class Cout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer ticket;   // ID du ticket lié

    @Column(nullable = false)
    private Double cout;      // ⭐ Double pour montant (ex: 150.50€)

    // ========== CONSTRUCTEURS ==========
    public Cout() {}

    public Cout(Integer ticket, Double cout) {
        this.ticket = ticket;
        this.cout = cout;
    }

    // ========== GETTERS / SETTERS ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTicket() { return ticket; }
    public void setTicket(Integer ticket) { this.ticket = ticket; }

    public Double getCout() { return cout; }
    public void setCout(Double cout) { this.cout = cout; }
}