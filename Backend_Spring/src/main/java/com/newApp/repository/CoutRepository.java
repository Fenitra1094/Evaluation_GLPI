package com.newApp.repository;

import com.newApp.entity.Cout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Transactional
public interface CoutRepository extends JpaRepository<Cout, Long> {

    // ⭐ Récupère TOUS les coûts d'un ticket, triés du PLUS RÉCENT au PLUS ANCIEN
    List<Cout> findByTicketOrderByCreatedAtDesc(Integer ticket);

    // ⭐ Récupère UNIQUEMENT le plus récent (plus optimisé)
    Optional<Cout> findFirstByTicketAndTypeOrderByCreatedAtDesc(Integer ticket, String type);

    @Query("""
        SELECT c FROM Cout c
        WHERE c.ticket = :ticket
          AND c.type = :type
          AND c.createdAt = :createdAt
    """)
    List<Cout> findByTicketAndTypeAndCreatedAt(
        @Param("ticket") Integer ticket,
        @Param("type") String type,
        @Param("createdAt") LocalDateTime createdAt
    );
}