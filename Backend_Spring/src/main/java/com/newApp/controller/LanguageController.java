package com.newApp.controller;

import com.newApp.entity.Language;
import com.newApp.repository.LanguageRepository;
import com.newApp.service.KanbanSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local/languages")
public class LanguageController {

    @Autowired
    private LanguageRepository repository;

    @Autowired
    private KanbanSettingService service;

    @GetMapping
    public List<Language> getAll() {
        return repository.findAll();
    }

    @GetMapping("/active")
    public List<Language> getActiveLanguages() {
        return service.getActiveLanguages();
    }

    @PostMapping
    public Language create(@RequestBody Language language) {
        return repository.save(language);
    }

    @PutMapping("/{code}")
    public Language update(@PathVariable String code, @RequestBody Language updated) {
        Language existing = repository.findById(code)
                .orElseThrow(() -> new RuntimeException("Language not found: " + code));
        existing.setName(updated.getName());
        existing.setFlag(updated.getFlag());
        existing.setIsActive(updated.getIsActive());
        existing.setIsDefault(updated.getIsDefault());
        return repository.save(existing);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<String> delete(@PathVariable String code) {
        repository.deleteById(code);
        return ResponseEntity.ok("Langue supprimée");
    }
    
    @DeleteMapping
    public ResponseEntity<String> deleteAll() {
        long count = repository.count();
        repository.deleteAll();
        return ResponseEntity.ok(count + " langues supprimées");
    }
}