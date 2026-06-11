package com.newApp.repository;

import com.newApp.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, String> {
    List<Language> findByIsActiveTrue();
}
