package com.newApp.repository;

import com.newApp.entity.LocalComputer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocalComputerRepository extends JpaRepository<LocalComputer, Long> {

    /** Vérifie si un ordinateur GLPI est déjà importé localement */
    Optional<LocalComputer> findByGlpiComputerId(Long glpiComputerId);
}