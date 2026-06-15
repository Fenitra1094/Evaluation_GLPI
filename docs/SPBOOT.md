# SPRING BOOT & SPRING DATA JPA

## Guide pratique : INSERT, UPDATE, DELETE, @Query, @Modifying et @Transactional

---

# 1. Introduction

Spring Data JPA simplifie l'accès aux données en évitant d'écrire manuellement la majorité des requêtes SQL.

Dans la plupart des cas, les opérations CRUD (Create, Read, Update, Delete) peuvent être réalisées directement avec les méthodes fournies par `JpaRepository`.

Avant d'utiliser :

* `@Query`
* `@Modifying`
* `@Transactional`

il est important de comprendre quand elles sont réellement nécessaires.

---

# 2. INSERT

## Méthode recommandée : save()

### Entité

```java
@Entity
@Table(name = "personne")
public class Personne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

}
```

### Repository

```java
@Repository
public interface PersonneRepository
        extends JpaRepository<Personne, Long> {
}
```

### Insertion

```java
Personne p = new Personne();
p.setNom("Fenitra");

personneRepository.save(p);
```

### SQL généré

```sql
INSERT INTO personne(nom)
VALUES ('Fenitra');
```

---

## Quand utiliser save() pour un INSERT ?

Utiliser `save()` lorsque :

* l'objet est nouveau
* l'identifiant est null
* on souhaite laisser JPA gérer l'insertion

Exemple :

```java
Personne p = new Personne();
p.setNom("Jean");

repository.save(p);
```

---

# 3. UPDATE

## Méthode recommandée : save()

### Exemple

```java
Personne p = repository.findById(1L).get();

p.setNom("Rakoto");

repository.save(p);
```

### SQL généré

```sql
UPDATE personne
SET nom = 'Rakoto'
WHERE id = 1;
```

---

## Pourquoi save() effectue un UPDATE ?

Spring Data JPA vérifie l'identifiant.

Si :

```java
id == null
```

→ INSERT

Si :

```java
id != null
```

→ UPDATE

---

## INSERT ou UPDATE ?

### INSERT

```java
Personne p = new Personne();

repository.save(p);
```

Résultat :

```sql
INSERT INTO ...
```

---

### UPDATE

```java
Personne p = repository.findById(1L).get();

repository.save(p);
```

Résultat :

```sql
UPDATE ...
```

---

# 4. DELETE

## Suppression par identifiant

```java
repository.deleteById(1L);
```

SQL :

```sql
DELETE FROM personne
WHERE id = 1;
```

---

## Suppression par objet

```java
Personne p = repository.findById(1L).get();

repository.delete(p);
```

---

# 5. Les méthodes automatiques de Spring Data JPA

Spring peut générer automatiquement certaines requêtes.

Exemples :

```java
findByNom(String nom)
```

```java
findByAge(Integer age)
```

```java
findByNomAndAge(String nom, Integer age)
```

```java
findByNomContaining(String nom)
```

```java
findByPrixGreaterThan(Double prix)
```

```java
findByDateBetween(Date debut, Date fin)
```

---

### Exemple

```java
List<Personne> findByNom(String nom);
```

Spring génère automatiquement :

```sql
SELECT *
FROM personne
WHERE nom = ?
```

---

# 6. Quand utiliser @Query ?

Utiliser `@Query` lorsque la requête devient complexe ou que Spring ne peut pas la générer facilement.

---

## Cas n°1 : Jointure

```java
@Query("""
SELECT e
FROM Employe e
JOIN e.departement d
WHERE d.nom = :nom
""")
List<Employe> findByDepartement(String nom);
```

---

## Cas n°2 : Agrégation

```java
@Query("""
SELECT SUM(c.montant)
FROM Cout c
""")
Double total();
```

---

## Cas n°3 : GROUP BY

```java
@Query("""
SELECT c.type,
       SUM(c.montant)
FROM Cout c
GROUP BY c.type
""")
List<Object[]> statistiques();
```

---

## Cas n°4 : Sous-requête

```java
@Query("""
SELECT p
FROM Produit p
WHERE p.prix >
(
    SELECT AVG(p2.prix)
    FROM Produit p2
)
""")
List<Produit> produitsPremium();
```

---

## Cas n°5 : Projection personnalisée

```java
@Query("""
SELECT p.nom,
       p.prix
FROM Produit p
""")
List<Object[]> liste();
```

---

# Quand NE PAS utiliser @Query ?

Éviter ceci :

```java
@Query("""
SELECT p
FROM Personne p
WHERE p.nom = :nom
""")
List<Personne> rechercher(String nom);
```

si ceci suffit :

```java
List<Personne> findByNom(String nom);
```

Toujours privilégier les méthodes automatiques lorsque c'est possible.

---

# 7. @Modifying

## Rôle

`@Modifying` indique à Spring que la requête modifie des données.

Elle est utilisée avec :

* UPDATE
* DELETE

faits directement via une requête JPQL ou SQL.

---

## UPDATE personnalisé

```java
@Modifying
@Query("""
UPDATE Personne p
SET p.nom = :nom
WHERE p.id = :id
""")
void modifier(Long id, String nom);
```

---

## DELETE personnalisé

```java
@Modifying
@Query("""
DELETE FROM Personne p
WHERE p.id = :id
""")
void supprimer(Long id);
```

---

## Pourquoi @Modifying ?

Par défaut :

```java
@Query
```

est considéré comme un SELECT.

Même si la requête contient :

```sql
UPDATE ...
```

ou

```sql
DELETE ...
```

Spring tentera de la traiter comme une lecture.

Pour signaler une modification :

```java
@Modifying
```

est obligatoire.

---

# 8. @Transactional

## Définition

`@Transactional` permet de regrouper plusieurs opérations dans une même transaction.

Toutes les opérations réussissent ou toutes sont annulées.

---

## Exemple

```java
@Transactional
public void transfert() {

    compteA.retirer(100);

    compteB.ajouter(100);

}
```

---

Si une erreur survient :

```java
compteB.ajouter(100);
```

alors :

```java
compteA.retirer(100);
```

sera également annulé.

---

# Cas où @Transactional est recommandé

## Plusieurs save()

```java
@Transactional
public void enregistrer() {

    repository1.save(...);

    repository2.save(...);

}
```

---

## Mise à jour personnalisée

```java
@Transactional
@Modifying
@Query("""
UPDATE Produit p
SET p.stock = p.stock - :qte
WHERE p.id = :id
""")
void diminuerStock(Long id, Integer qte);
```

---

## Suppression personnalisée

```java
@Transactional
@Modifying
@Query("""
DELETE FROM Produit p
WHERE p.id = :id
""")
void supprimer(Long id);
```

---

## Traitement métier complexe

```java
@Transactional
public void validerCommande() {

    commandeRepository.save(commande);

    stockRepository.diminuer(...);

    paiementRepository.enregistrer(...);

}
```

Si une étape échoue, tout est annulé.

---

# Cas où @Transactional n'est généralement pas nécessaire

Lecture simple :

```java
findAll()
```

```java
findById(...)
```

```java
findByNom(...)
```

```java
findByDateBetween(...)
```

Ces opérations ne modifient pas les données.

---

# 9. Cas pratiques réels

## Exemple complet

```java
@Repository
public interface ProduitRepository
extends JpaRepository<Produit, Long> {

    @Query("""
    SELECT p
    FROM Produit p
    WHERE p.prix > :prix
    """)
    List<Produit> findCher(Double prix);

    @Transactional
    @Modifying
    @Query("""
    UPDATE Produit p
    SET p.prix = :prix
    WHERE p.id = :id
    """)
    void changerPrix(Long id, Double prix);

    @Transactional
    @Modifying
    @Query("""
    DELETE FROM Produit p
    WHERE p.id = :id
    """)
    void supprimer(Long id);
}
```

---

# 10. Résumé des bonnes pratiques

| Besoin                           | Solution recommandée                 |
| -------------------------------- | ------------------------------------ |
| INSERT                           | save()                               |
| UPDATE simple                    | save()                               |
| DELETE simple                    | delete() ou deleteById()             |
| SELECT simple                    | findBy...()                          |
| SELECT complexe                  | @Query                               |
| UPDATE JPQL/SQL                  | @Query + @Modifying + @Transactional |
| DELETE JPQL/SQL                  | @Query + @Modifying + @Transactional |
| Plusieurs opérations dépendantes | @Transactional                       |
| Lecture simple                   | Pas besoin de @Transactional         |

---

# Règle d'or

Toujours suivre cet ordre :

1. Utiliser les méthodes de JpaRepository.
2. Utiliser les méthodes automatiques `findBy...`.
3. Utiliser `@Query` uniquement si nécessaire.
4. Ajouter `@Modifying` pour UPDATE ou DELETE personnalisés.
5. Ajouter `@Transactional` lorsque plusieurs opérations doivent être exécutées de manière atomique.

Cette approche permet d'avoir un code plus simple, plus maintenable et conforme aux bonnes pratiques Spring Boot.
