package com.newApp.repository;

import com.newApp.entity.Cout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Transactional
public interface CoutRepository extends JpaRepository<Cout, Long> {

    // ⭐ Récupère TOUS les coûts d'un ticket, triés du PLUS RÉCENT au PLUS ANCIEN
    List<Cout> findByTicketOrderByCreatedAtDesc(Integer ticket);

    // ⭐ Récupère UNIQUEMENT le plus récent (plus optimisé)
    Optional<Cout> findFirstByTicketOrderByCreatedAtDesc(Integer ticket);

    
}