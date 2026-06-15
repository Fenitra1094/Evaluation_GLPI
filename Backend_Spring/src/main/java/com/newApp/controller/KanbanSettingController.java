package com.newApp.controller;

import com.newApp.entity.KanbanSetting;
import com.newApp.service.KanbanSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local/kanban-settings")
public class KanbanSettingController {

    @Autowired
    private KanbanSettingService service;

    @GetMapping
    public List<KanbanSetting> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public KanbanSetting update(@PathVariable Long id, @RequestBody KanbanSetting setting) {
        return service.update(id, setting);
    }

    @PostMapping("/reset")
    public ResponseEntity<String> reset() {
        service.resetToDefaults();
        return ResponseEntity.ok("Réinitialisé");
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAll() {
        long count = service.getAll().size();
        // On utilise déjà /reset qui supprime + recrée les défauts
        service.resetToDefaults();
        return ResponseEntity.ok(count + " settings réinitialisés");
    }

    
}