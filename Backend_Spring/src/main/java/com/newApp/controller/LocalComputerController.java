package com.newapp.controller;

import com.newapp.dto.LocalComputerDto;
import com.newapp.entity.LocalComputer;
import com.newapp.service.LocalComputerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local/computers")
public class LocalComputerController {

    private final LocalComputerService service;

    public LocalComputerController(LocalComputerService service) {
        this.service = service;
    }

    // GET /api/local/computers
    @GetMapping
    public List<LocalComputer> findAll() {
        return service.findAll();
    }

    // GET /api/local/computers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LocalComputer> findById(@PathVariable Long id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/local/computers
    @PostMapping
    public ResponseEntity<LocalComputer> create(@Valid @RequestBody LocalComputerDto dto) {
        LocalComputer created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    // PUT /api/local/computers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<LocalComputer> update(
        @PathVariable Long id,
        @Valid @RequestBody LocalComputerDto dto
    ) {
        return service.update(id, dto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/local/computers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE /api/local/computers
    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        service.deleteAll();
        return ResponseEntity.noContent().build();
    }
}