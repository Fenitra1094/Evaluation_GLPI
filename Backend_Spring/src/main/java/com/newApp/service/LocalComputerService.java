package com.newapp.service;

import com.newapp.dto.LocalComputerDto;
import com.newapp.entity.LocalComputer;
import com.newapp.repository.LocalComputerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocalComputerService {

    private final LocalComputerRepository repository;

    public LocalComputerService(LocalComputerRepository repository) {
        this.repository = repository;
    }

    public List<LocalComputer> findAll() {
        return repository.findAll();
    }

    public Optional<LocalComputer> findById(Long id) {
        return repository.findById(id);
    }

    public LocalComputer create(LocalComputerDto dto) {
        LocalComputer c = new LocalComputer();
        applyDto(c, dto);
        return repository.save(c);
    }

    public Optional<LocalComputer> update(Long id, LocalComputerDto dto) {
        return repository.findById(id).map(c -> {
            applyDto(c, dto);
            return repository.save(c);
        });
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    private void applyDto(LocalComputer c, LocalComputerDto dto) {
        c.setGlpiComputerId(dto.getGlpiComputerId());
        c.setName(dto.getName());
        c.setSerial(dto.getSerial());
        c.setLocalNote(dto.getLocalNote());
        c.setCustomTag(dto.getCustomTag());
        c.setPriority(dto.getPriority());
        c.setImportedFromGlpi(
            dto.getImportedFromGlpi() != null && dto.getImportedFromGlpi()
        );
    }
}