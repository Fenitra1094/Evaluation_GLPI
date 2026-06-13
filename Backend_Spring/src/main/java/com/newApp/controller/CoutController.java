package com.newApp.controller;

import com.newApp.entity.Cout;
import com.newApp.repository.CoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/local/cout")
public class CoutController {

    @Autowired
    private CoutRepository coutRep;

    @GetMapping
    public List<Cout> getAll() {
        return coutRep.findAll();
    }

    @PostMapping("/creer")
    public Cout create(@RequestBody Cout cout) {   // ⭐ AJOUT @RequestBody
        System.out.println("📦 Reçu : ticket=" + cout.getTicket() + ", cout=" + cout.getCout());
        return coutRep.save(cout);
    }

    @DeleteMapping("/annulation/{ticket}")
    public void delete(@PathVariable Integer ticket ) {
        //Long id = coutRep.findByTicket(ticket);
        coutRep.deleteByTicket(ticket);
    }
}