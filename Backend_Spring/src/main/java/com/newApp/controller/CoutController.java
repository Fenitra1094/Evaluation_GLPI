package com.newApp.controller;

import com.newApp.entity.Cout;
import com.newApp.repository.CoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.Map;


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

    // ⭐ Supprimer le DERNIER coût ajouté d'un ticket (le plus récent)
    @DeleteMapping("/ticket/{ticketId}/last")
    public ResponseEntity<String> deleteLastByTicket(@PathVariable Integer ticketId) {

        // 1. Trouver le coût le plus récent
        Optional<Cout> dernierCout = coutRep.findFirstByTicketOrderByCreatedAtDesc(ticketId);

        // 2. S'il n'existe pas → 404
        if (dernierCout.isEmpty()) {
            return ResponseEntity
                .status(404)
                .body("Aucun coût trouvé pour le ticket #" + ticketId);
        }

        // 3. Le supprimer (UN SEUL)
        Cout cout = dernierCout.get();
        coutRep.delete(cout);

        System.out.println("🗑️ Coût #" + cout.getId() +
                           " supprimé (ticket=" + ticketId +
                           ", créé le " + cout.getCreatedAt() + 
                           ", montant=" + cout.getCout() + "€)");

        return ResponseEntity.ok(
            "Coût #" + cout.getId() + " (" + cout.getCout() + "€) supprimé"
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        coutRep.deleteById(id);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAll() {
        long count = coutRep.count();
        coutRep.deleteAll();
        return ResponseEntity.ok(count + " coûts supprimés");
    }


    // ⭐ Réouverture : crée un coût de type REOUVERTURE
    @PostMapping("/reouverture/{ticketId}")
    public ResponseEntity<?> reouverture(
        @PathVariable Integer ticketId,
        @RequestBody Map<String, Double> body
    ) {
        Double pourcentage = body.get("pourcentage");

        if (pourcentage == null || pourcentage <= 0) {
            return ResponseEntity.badRequest().body("Pourcentage invalide");
        }

        // Trouver le DERNIER coût (le plus récent)
        Optional<Cout> dernierCout = coutRep.findFirstByTicketOrderByCreatedAtDesc(ticketId);

        if (dernierCout.isEmpty()) {
            return ResponseEntity.status(404).body("Aucun coût trouvé pour ticket #" + ticketId);
        }

        // Calculer
        Double coutPrecedent = dernierCout.get().getCout();
        Double nouveauCout = (pourcentage / 100.0) * coutPrecedent;

        // ⭐ Créer avec type REOUVERTURE
        Cout coutReouverture = new Cout(ticketId, nouveauCout, "REOUVERTURE");
        Cout saved = coutRep.save(coutReouverture);

        System.out.println("🔄 Réouverture ticket #" + ticketId +
                           " : " + pourcentage + "% × " + coutPrecedent + 
                           "€ = " + nouveauCout + "€ (type=REOUVERTURE)");

        return ResponseEntity.ok(saved);
    }
}