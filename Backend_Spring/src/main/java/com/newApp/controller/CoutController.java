package com.newApp.controller;

import com.newApp.entity.Cout;
import com.newApp.repository.CoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.HashMap;
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

    @GetMapping("/dernierCout/{ticketId}")
    public ResponseEntity<?> getDernierCoutByTicket(@PathVariable Integer ticketId) {

        // 1. Trouver le dernier coût SAISI (n'importe lequel, on veut son timestamp)
        Optional<Cout> dernierCoutOpt = coutRep
            .findFirstByTicketAndTypeOrderByCreatedAtDesc(ticketId, "SAISI");

        if (dernierCoutOpt.isEmpty()) {
            return ResponseEntity.status(404)
                .body(Map.of("message", "Aucun coût SAISI trouvé pour ticket #" + ticketId));
        }

        Cout dernierCout = dernierCoutOpt.get();
        LocalDateTime timestamp = dernierCout.getCreatedAt();

        // 2. Récupérer TOUS les coûts SAISI du même timestamp pour ce ticket
        List<Cout> coutsMemeTimestamp = coutRep
            .findByTicketAndTypeAndCreatedAt(ticketId, "SAISI", timestamp);

        // 3. Calculer la somme
        Double totalCout = coutsMemeTimestamp.stream()
            .mapToDouble(Cout::getCout)
            .sum();

        System.out.println("📊 Dernier SAISI ticket #" + ticketId +
                        " : " + coutsMemeTimestamp.size() + " ligne(s), total = " + totalCout + "€");

        // 4. Retourner un objet identique au format Cout mais avec le total
        Map<String, Object> response = new HashMap<>();
        response.put("id",         dernierCout.getId());
        response.put("ticket",     dernierCout.getTicket());
        response.put("cout",       totalCout);                // ⭐ TOTAL
        response.put("type",       dernierCout.getType());
        response.put("createdAt",  dernierCout.getCreatedAt());
        response.put("nbLignes",   coutsMemeTimestamp.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/debutCout/{ticketId}")
    public ResponseEntity<?> getDebutCoutByTicket(@PathVariable Integer ticketId) {

        // 1. Trouver le dernier coût SAISI (n'importe lequel, on veut son timestamp)
        Optional<Cout> debutCoutOpt = coutRep
            .findFirstByTicketAndTypeOrderByCreatedAtAsc(ticketId, "SAISI");

        if (debutCoutOpt.isEmpty()) {
            return ResponseEntity.status(404)
                .body(Map.of("message", "Aucun coût SAISI trouvé pour ticket #" + ticketId));
        }

        Cout debutCout = debutCoutOpt.get();
        LocalDateTime timestamp = debutCout.getCreatedAt();

        // 2. Récupérer TOUS les coûts SAISI du même timestamp pour ce ticket
        List<Cout> coutsMemeTimestamp = coutRep
            .findByTicketAndTypeAndCreatedAt(ticketId, "SAISI", timestamp);

        // 3. Calculer la somme
        Double totalCout = coutsMemeTimestamp.stream()
            .mapToDouble(Cout::getCout)
            .sum();

        System.out.println("📊 Dernier SAISI ticket #" + ticketId +
                        " : " + coutsMemeTimestamp.size() + " ligne(s), total = " + totalCout + "€");

        // 4. Retourner un objet identique au format Cout mais avec le total
        Map<String, Object> response = new HashMap<>();
        response.put("id",         debutCout.getId());
        response.put("ticket",     debutCout.getTicket());
        response.put("cout",       totalCout);                // ⭐ TOTAL
        response.put("type",       debutCout.getType());
        response.put("createdAt",  debutCout.getCreatedAt());
        response.put("nbLignes",   coutsMemeTimestamp.size());

        return ResponseEntity.ok(response);
    }

     @GetMapping("/moyenCout/{ticketId}")
    public Double getMoyenCoutByTicket(@PathVariable Integer ticketId) {

        // 1. Trouver le dernier coût SAISI (n'importe lequel, on veut son timestamp)
        List<Cout> debutCoutOpt = coutRep
            .findByTicketAndType(ticketId, "SAISI");

        
        
        List<Object> coutsMemeTimestamp = coutRep
            .findObject(ticketId, "SAISI");


        // 3. Calculer la somme
        Double totalCout = debutCoutOpt.stream()
            .mapToDouble(Cout::getCout)
            .sum();
        
        Double moyen = totalCout/coutsMemeTimestamp.size();


        
        

        System.out.println("📊 Dernier SAISI ticket #" + ticketId +
                        " : " + coutsMemeTimestamp.size() + " ligne(s)sssss, total = " + totalCout + ", moyen" +moyen);

        return moyen;
    }

    @GetMapping("/sommeCout/{ticketId}")
    public Double getSommeCoutByTicket(@PathVariable Integer ticketId) {

        // 1. Trouver le dernier coût SAISI (n'importe lequel, on veut son timestamp)
        List<Cout> debutCoutOpt = coutRep
            .findByTicketAndTypeOrderByCreatedAtDesc(ticketId, "SAISI");
        

        // 3. Calculer la somme
        Double totalCout = debutCoutOpt.stream()
            .mapToDouble(Cout::getCout)
            .sum(); 

        System.out.println("📊 Dernier SAISI ticket #" + ticketId +
                        " : " + debutCoutOpt.size() + " ligne(s), total = " + totalCout + "€");

        return totalCout;
    }



    // // ⭐ Supprimer le DERNIER coût ajouté d'un ticket (le plus récent)
    // @DeleteMapping("/ticket/{ticketId}/last")
    // public ResponseEntity<String> deleteLastByTicket(@PathVariable Integer ticketId) {

    //     // 1. Trouver le coût le plus récent
    //     Optional<Cout> dernierCout = coutRep.findFirstByTicketOrderByCreatedAtDesc(ticketId);

    //     // 2. S'il n'existe pas → 404
    //     if (dernierCout.isEmpty()) {
    //         return ResponseEntity
    //             .status(404)
    //             .body("Aucun coût trouvé pour le ticket #" + ticketId);
    //     }

    //     // 3. Le supprimer (UN SEUL)
    //     Cout cout = dernierCout.get();
    //     coutRep.delete(cout);

    //     System.out.println("🗑️ Coût #" + cout.getId() +
    //                        " supprimé (ticket=" + ticketId +
    //                        ", créé le " + cout.getCreatedAt() + 
    //                        ", montant=" + cout.getCout() + "€)");

    //     return ResponseEntity.ok(
    //         "Coût #" + cout.getId() + " (" + cout.getCout() + "€) supprimé"
    //     );
    // }

    /**
 * ⭐ Supprime le DERNIER SAISI d'un ticket
 *    Toutes les lignes du même timestamp sont supprimées en bloc
 *    Utilisé pour le cas CANCEL (annulation)
 */
@DeleteMapping("/annulerDernier/{ticketId}")
public ResponseEntity<?> annulerDernierSaisi(@PathVariable Integer ticketId) {

    // 1. Trouver le dernier coût SAISI (pour avoir son timestamp)
    Optional<Cout> dernierCoutOpt = coutRep
        .findFirstByTicketAndTypeOrderByCreatedAtDesc(ticketId, "SAISI");

    if (dernierCoutOpt.isEmpty()) {
        return ResponseEntity.status(404)
            .body(Map.of("message", "Aucun coût SAISI à annuler pour ticket #" + ticketId));
    }

    Cout dernierCout = dernierCoutOpt.get();
    LocalDateTime timestamp = dernierCout.getCreatedAt();

    // 2. Récupérer TOUS les coûts SAISI de ce même timestamp (toutes les lignes du batch)
    List<Cout> coutsASupprimer = coutRep
        .findByTicketAndTypeAndCreatedAt(ticketId, "SAISI", timestamp);

    // 3. Calculer le total avant suppression (pour le log et le retour)
    Double totalSupprime = coutsASupprimer.stream()
        .mapToDouble(Cout::getCout)
        .sum();

    // 4. Tout supprimer
    coutRep.deleteAll(coutsASupprimer);

    System.out.println("🗑️ Annulation ticket #" + ticketId +
                       " : " + coutsASupprimer.size() +
                       " ligne(s) SAISI supprimée(s) (total: " + totalSupprime + "€)");

    // 5. Retourner le résultat
    Map<String, Object> response = new HashMap<>();
    response.put("message",       "Dernier SAISI annulé avec succès");
    response.put("ticketId",      ticketId);
    response.put("nbSupprimes",   coutsASupprimer.size());
    response.put("totalSupprime", totalSupprime);
    response.put("timestamp",     timestamp);

    return ResponseEntity.ok(response);
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

    // @PostMapping("/annuler/{ticketId}")
    // public ResponseEntity<?>AnnulationTicket( @PathVariable Integer ticketId) {
    //    Optional<Cout> dernierCout = coutRep.findFirstByTicketOrderByCreatedAtDesc(ticketId);
    //     if (dernierCout.isEmpty()) {
    //         return ResponseEntity.status(404).body("Aucun coût trouvé pour ticket #" + ticketId);
    //     }
    //     Double coutAnnuler = dernierCout.get().getCout();
    //     Double coutt = - coutAnnuler;
    //     Cout Annulation = new Cout(ticketId,coutt , "CANCEL");

    //     Cout saved = coutRep.save(Annulation);
    //     return ResponseEntity.ok(saved);
    // }


    // ⭐ Réouverture : crée un coût de type REOUVERTURE
    // @PostMapping("/reouverture/{ticketId}")
    // public ResponseEntity<?> reouverture(
    //     @PathVariable Integer ticketId,
    //     @RequestBody Map<String, Double> body
    // ) {
    //     Double pourcentage = body.get("pourcentage");

    //     if (pourcentage == null || pourcentage <= 0) {
    //         return ResponseEntity.badRequest().body("Pourcentage invalide");
    //     }

    //     // Trouver le DERNIER coût (le plus récent)
    //     Optional<Cout> dernierCout = coutRep.findFirstByTicketOrderByCreatedAtDesc(ticketId);

    //     if (dernierCout.isEmpty()) {
    //         return ResponseEntity.status(404).body("Aucun coût trouvé pour ticket #" + ticketId);
    //     }

    //     // Calculer
    //     Double coutPrecedent = dernierCout.get().getCout();
    //     Double nouveauCout = (pourcentage / 100.0) * coutPrecedent;

    //     // ⭐ Créer avec type REOUVERTURE
    //     Cout coutReouverture = new Cout(ticketId, nouveauCout, "REOUVERTURE");
    //     Cout saved = coutRep.save(coutReouverture);

    //     System.out.println("🔄 Réouverture ticket #" + ticketId +
    //                        " : " + pourcentage + "% × " + coutPrecedent + 
    //                        "€ = " + nouveauCout + "€ (type=REOUVERTURE)");

    //     return ResponseEntity.ok(saved);
    // }
}