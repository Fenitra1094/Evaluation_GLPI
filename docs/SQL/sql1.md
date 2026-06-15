# SQL FONDAMENTAL (MariaDB)

## Guide complet pour développeur Spring Boot

---

# 1. Introduction

SQL (Structured Query Language) est le langage utilisé pour communiquer avec une base de données relationnelle.

Dans MariaDB, PostgreSQL, MySQL ou Oracle, les principes fondamentaux restent les mêmes.

Nous utiliserons la table suivante :

```sql
CREATE TABLE voyageur (
    id INT PRIMARY KEY,
    nom VARCHAR(100),
    ville VARCHAR(100),
    age INT,
    prix_billet DECIMAL(10,2)
);
```

Exemple de données :

| id | nom   | ville        | age | prix_billet |
| -- | ----- | ------------ | --- | ----------- |
| 1  | Jean  | Tana         | 25  | 30000       |
| 2  | Marie | Majunga      | 30  | 50000       |
| 3  | Paul  | Tana         | 18  | 30000       |
| 4  | Sarah | Fianarantsoa | 40  | 45000       |

---

# 2. SELECT

Permet de lire les données.

## Toutes les colonnes

```sql
SELECT *
FROM voyageur;
```

Résultat :

| id | nom   | ville        | age | prix_billet |
| -- | ----- | ------------ | --- | ----------- |
| 1  | Jean  | Tana         | 25  | 30000       |
| 2  | Marie | Majunga      | 30  | 50000       |
| 3  | Paul  | Tana         | 18  | 30000       |
| 4  | Sarah | Fianarantsoa | 40  | 45000       |

---

## Colonnes spécifiques

```sql
SELECT nom, ville
FROM voyageur;
```

Résultat :

| nom   | ville        |
| ----- | ------------ |
| Jean  | Tana         |
| Marie | Majunga      |
| Paul  | Tana         |
| Sarah | Fianarantsoa |

---

# 3. WHERE

Permet de filtrer.

## Egalité

```sql
SELECT *
FROM voyageur
WHERE ville = 'Tana';
```

---

## Supérieur à

```sql
SELECT *
FROM voyageur
WHERE age > 25;
```

---

## Inférieur à

```sql
SELECT *
FROM voyageur
WHERE prix_billet < 40000;
```

---

# 4. Opérateurs logiques

## AND

Les deux conditions doivent être vraies.

```sql
SELECT *
FROM voyageur
WHERE ville='Tana'
AND age > 20;
```

---

## OR

Une seule condition suffit.

```sql
SELECT *
FROM voyageur
WHERE ville='Tana'
OR ville='Majunga';
```

---

## NOT

```sql
SELECT *
FROM voyageur
WHERE NOT ville='Tana';
```

---

# 5. ORDER BY

Permet de trier.

---

## ASC (croissant)

```sql
SELECT *
FROM voyageur
ORDER BY age ASC;
```

Résultat :

18 → 25 → 30 → 40

---

## DESC (décroissant)

```sql
SELECT *
FROM voyageur
ORDER BY age DESC;
```

Résultat :

40 → 30 → 25 → 18

---

## Plusieurs colonnes

```sql
SELECT *
FROM voyageur
ORDER BY ville ASC, age DESC;
```

D'abord tri par ville puis par âge.

---

# 6. LIMIT

Permet de limiter le nombre de résultats.

---

## Premier résultat

```sql
SELECT *
FROM voyageur
LIMIT 1;
```

---

## Trois premiers résultats

```sql
SELECT *
FROM voyageur
LIMIT 3;
```

---

## Pagination

```sql
SELECT *
FROM voyageur
LIMIT 5 OFFSET 10;
```

Equivalent :

```sql
SELECT *
FROM voyageur
LIMIT 10,5;
```

Commence au 11ème enregistrement et retourne 5 lignes.

---

# 7. DISTINCT

Supprime les doublons.

```sql
SELECT DISTINCT ville
FROM voyageur;
```

Résultat :

| ville        |
| ------------ |
| Tana         |
| Majunga      |
| Fianarantsoa |

---

# 8. LIKE

Recherche de texte.

---

## Commence par

```sql
SELECT *
FROM voyageur
WHERE nom LIKE 'J%';
```

Jean

---

## Termine par

```sql
SELECT *
FROM voyageur
WHERE nom LIKE '%e';
```

Marie

---

## Contient

```sql
SELECT *
FROM voyageur
WHERE nom LIKE '%ar%';
```

Sarah

---

# 9. IN

Remplace plusieurs OR.

---

Mauvaise pratique :

```sql
WHERE ville='Tana'
OR ville='Majunga'
OR ville='Toamasina'
```

Bonne pratique :

```sql
SELECT *
FROM voyageur
WHERE ville IN
('Tana','Majunga','Toamasina');
```

---

# 10. NOT IN

```sql
SELECT *
FROM voyageur
WHERE ville NOT IN
('Tana','Majunga');
```

---

# 11. BETWEEN

Intervalle.

```sql
SELECT *
FROM voyageur
WHERE age BETWEEN 20 AND 35;
```

Equivalent :

```sql
WHERE age >=20
AND age <=35
```

---

# 12. IS NULL

Recherche les valeurs nulles.

```sql
SELECT *
FROM voyageur
WHERE ville IS NULL;
```

---

# 13. IS NOT NULL

```sql
SELECT *
FROM voyageur
WHERE ville IS NOT NULL;
```

---

# 14. Alias (AS)

Renommer une colonne.

```sql
SELECT nom AS voyageur
FROM voyageur;
```

---

## Alias de table

```sql
SELECT v.nom
FROM voyageur v;
```

Très utilisé dans les jointures.

---

# 15. Fonctions de base

## COUNT

Compter.

```sql
SELECT COUNT(*)
FROM voyageur;
```

---

## SUM

Somme.

```sql
SELECT SUM(prix_billet)
FROM voyageur;
```

---

## AVG

Moyenne.

```sql
SELECT AVG(prix_billet)
FROM voyageur;
```

---

## MAX

Valeur maximale.

```sql
SELECT MAX(prix_billet)
FROM voyageur;
```

---

## MIN

Valeur minimale.

```sql
SELECT MIN(prix_billet)
FROM voyageur;
```

---

# 16. INSERT

Ajouter une ligne.

```sql
INSERT INTO voyageur
(
nom,
ville,
age,
prix_billet
)
VALUES
(
'Fenitra',
'Tana',
20,
35000
);
```

---

# 17. UPDATE

Modifier des données.

```sql
UPDATE voyageur
SET ville='Majunga'
WHERE id=1;
```

---

## Plusieurs colonnes

```sql
UPDATE voyageur
SET ville='Majunga',
    age=35
WHERE id=1;
```

---

# 18. DELETE

Supprimer une ligne.

```sql
DELETE FROM voyageur
WHERE id=1;
```

---

⚠ Toujours mettre un WHERE.

Danger :

```sql
DELETE FROM voyageur;
```

Toutes les lignes seront supprimées.

---

# 19. Ordre d'exécution logique d'une requête

Quand SQL exécute :

```sql
SELECT nom
FROM voyageur
WHERE age > 20
ORDER BY age DESC
LIMIT 3;
```

L'ordre réel est :

```text
1. FROM
2. WHERE
3. SELECT
4. ORDER BY
5. LIMIT
```

---

# 20. Requête complète typique

```sql
SELECT nom,
       ville,
       prix_billet
FROM voyageur
WHERE ville IN ('Tana','Majunga')
AND prix_billet > 25000
ORDER BY prix_billet DESC
LIMIT 5;
```

Cette requête :

1. Lit la table voyageur
2. Garde seulement Tana et Majunga
3. Garde les billets > 25000
4. Trie du plus cher au moins cher
5. Retourne les 5 premiers résultats

---

# Bonnes pratiques

✔ Toujours mettre un WHERE dans UPDATE

✔ Toujours mettre un WHERE dans DELETE

✔ Utiliser DISTINCT uniquement si nécessaire

✔ Utiliser LIMIT pour les listes volumineuses

✔ Utiliser IN au lieu de plusieurs OR

✔ Trier avec ORDER BY lorsque l'ordre est important

✔ Utiliser des alias pour améliorer la lisibilité

✔ Préférer des noms de colonnes explicites au lieu de SELECT *

---

# À maîtriser avant le SQL avancé

* SELECT
* WHERE
* AND / OR / NOT
* ORDER BY ASC
* ORDER BY DESC
* LIMIT
* DISTINCT
* LIKE
* IN
* NOT IN
* BETWEEN
* IS NULL
* COUNT
* SUM
* AVG
* MIN
* MAX
* INSERT
* UPDATE
* DELETE
