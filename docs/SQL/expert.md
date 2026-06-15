# SQL EXPERT (MariaDB)

## Jointures, Relations, Vues, Index et Optimisation

---

# 1. Pourquoi les jointures existent ?

Dans une vraie base de données, les informations sont réparties dans plusieurs tables.

Exemple Taxi-Brousse :

## Table chauffeur

```sql id="5krn0k"
CREATE TABLE chauffeur(
    id INT PRIMARY KEY,
    nom VARCHAR(100)
);
```

| id | nom  |
| -- | ---- |
| 1  | Jean |
| 2  | Paul |

---

## Table voyage

```sql id="1wz0ea"
CREATE TABLE voyage(
    id INT PRIMARY KEY,
    destination VARCHAR(100),
    chauffeur_id INT
);
```

| id | destination | chauffeur_id |
| -- | ----------- | ------------ |
| 1  | Majunga     | 1            |
| 2  | Toamasina   | 2            |

---

Question :

> Quel chauffeur effectue quel voyage ?

Pour répondre :

```sql id="ktg4tr"
SELECT *
FROM voyage
INNER JOIN chauffeur
ON voyage.chauffeur_id = chauffeur.id;
```

---

# 2. INNER JOIN

La jointure la plus utilisée.

Retourne uniquement les correspondances.

```sql id="b9a5rj"
SELECT *
FROM voyage v
INNER JOIN chauffeur c
ON v.chauffeur_id = c.id;
```

Résultat :

| voyage | destination | chauffeur |
| ------ | ----------- | --------- |
| 1      | Majunga     | Jean      |
| 2      | Toamasina   | Paul      |

---

## Version recommandée

```sql id="i2lkw7"
SELECT
v.id,
v.destination,
c.nom
FROM voyage v
INNER JOIN chauffeur c
ON v.chauffeur_id = c.id;
```

---

# 3. LEFT JOIN

Retourne toutes les lignes de gauche.

Même si aucune correspondance n'existe.

---

## Exemple

chauffeur :

| id | nom   |
| -- | ----- |
| 1  | Jean  |
| 2  | Paul  |
| 3  | Sarah |

---

voyage :

| id | destination | chauffeur_id |
| -- | ----------- | ------------ |
| 1  | Majunga     | 1            |
| 2  | Toamasina   | 2            |

---

```sql id="1sw8k0"
SELECT *
FROM chauffeur c
LEFT JOIN voyage v
ON c.id = v.chauffeur_id;
```

Résultat :

| chauffeur | voyage    |
| --------- | --------- |
| Jean      | Majunga   |
| Paul      | Toamasina |
| Sarah     | NULL      |

Sarah apparaît même sans voyage.

---

# 4. RIGHT JOIN

Retourne toutes les lignes de droite.

```sql id="6eyq99"
SELECT *
FROM chauffeur c
RIGHT JOIN voyage v
ON c.id = v.chauffeur_id;
```

---

Dans la pratique :

```text id="gx72v5"
LEFT JOIN est largement préféré.
```

---

# 5. FULL OUTER JOIN

MariaDB ne le supporte pas directement.

On le simule avec :

```sql id="3g6swm"
LEFT JOIN

UNION

RIGHT JOIN
```

---

# 6. CROSS JOIN

Produit cartésien.

Chaque ligne est combinée avec toutes les autres.

---

Exemple :

3 chauffeurs

2 véhicules

Résultat :

```text id="g5cnc2"
3 x 2 = 6 lignes
```

```sql id="5dnkr5"
SELECT *
FROM chauffeur
CROSS JOIN vehicule;
```

---

# 7. SELF JOIN

Jointure d'une table sur elle-même.

---

Table employe

| id | nom       | manager_id |
| -- | --------- | ---------- |
| 1  | Directeur | NULL       |
| 2  | Jean      | 1          |
| 3  | Paul      | 1          |

---

```sql id="qvw8yr"
SELECT
e.nom,
m.nom
FROM employe e
LEFT JOIN employe m
ON e.manager_id = m.id;
```

Résultat :

| Employé | Manager   |
| ------- | --------- |
| Jean    | Directeur |
| Paul    | Directeur |

---

# 8. Relation One-To-Many (1-N)

Exemple :

Un chauffeur possède plusieurs voyages.

```text id="hwtd7p"
chauffeur
    |
    |
    |
voyage
```

---

Table voyage

```sql id="ukvvsj"
chauffeur_id INT
```

est la clé étrangère.

---

# 9. Relation Many-To-One (N-1)

Même relation vue dans l'autre sens.

Plusieurs voyages

↓

Un chauffeur

---

# 10. Relation Many-To-Many (N-N)

Très importante.

---

Exemple :

Un voyage peut avoir plusieurs passagers.

Un passager peut effectuer plusieurs voyages.

---

```text id="q41b2c"
passager

voyage_passager

voyage
```

---

Table intermédiaire

```sql id="cxf5oq"
CREATE TABLE voyage_passager(
    voyage_id INT,
    passager_id INT
);
```

---

# 11. Triple Jointure

```sql id="kjjvyt"
SELECT
v.destination,
p.nom
FROM voyage v
INNER JOIN voyage_passager vp
ON v.id = vp.voyage_id
INNER JOIN passager p
ON vp.passager_id = p.id;
```

---

# 12. Alias

Toujours utiliser des alias.

Mauvais :

```sql id="zhrvhu"
SELECT *
FROM voyage
INNER JOIN chauffeur
```

---

Bon :

```sql id="e3w1sa"
SELECT *
FROM voyage v
INNER JOIN chauffeur c
```

---

# 13. Vue (VIEW)

Une vue est une requête enregistrée.

---

Création :

```sql id="6gtrp4"
CREATE VIEW vue_voyage AS
SELECT
v.id,
v.destination,
c.nom chauffeur
FROM voyage v
INNER JOIN chauffeur c
ON v.chauffeur_id = c.id;
```

---

Utilisation :

```sql id="f1tdx9"
SELECT *
FROM vue_voyage;
```

---

# 14. Pourquoi utiliser une VIEW ?

Pour éviter :

```sql id="snk87u"
JOIN
JOIN
JOIN
JOIN
```

à chaque requête.

---

# 15. Index

Un index accélère les recherches.

---

Sans index :

```sql id="6fup83"
SELECT *
FROM voyage
WHERE destination='Majunga';
```

SQL parcourt toute la table.

---

Avec index :

```sql id="v6c80s"
CREATE INDEX idx_destination
ON voyage(destination);
```

Recherche beaucoup plus rapide.

---

# 16. Colonnes à indexer

Très souvent :

```sql id="mjlwmc"
id
```

```sql id="pdjlwm"
code
```

```sql id="xg6yxq"
email
```

```sql id="7zpp8x"
date
```

```sql id="tmzwr8"
foreign key
```

---

# 17. Colonnes à ne pas indexer

Mauvais candidat :

```sql id="i9phmf"
sexe
```

avec seulement :

```text id="7utgzs"
H
F
```

Peu de valeurs distinctes.

---

# 18. Optimisation

Toujours filtrer tôt.

---

Mauvais :

```sql id="qfdty2"
SELECT *
FROM voyage
ORDER BY destination;
```

---

Meilleur :

```sql id="qjef7i"
SELECT *
FROM voyage
WHERE destination='Majunga'
ORDER BY destination;
```

---

# 19. Eviter SELECT *

Mauvais :

```sql id="0a5gju"
SELECT *
FROM voyage;
```

---

Bon :

```sql id="1j5gwc"
SELECT
id,
destination
FROM voyage;
```

---

# 20. Requête métier réelle (Taxi-Brousse)

Nombre de passagers par destination.

```sql id="v8bhn6"
SELECT
v.destination,
COUNT(vp.passager_id) nb_passagers
FROM voyage v
LEFT JOIN voyage_passager vp
ON v.id = vp.voyage_id
GROUP BY v.destination;
```

---

# 21. Requête métier réelle (Coffee-Cacao)

Quantité totale par matière première.

```sql id="59s9kg"
SELECT
mp.nom,
SUM(stock.quantite)
FROM matiere_premiere mp
INNER JOIN stock
ON mp.id = stock.matiere_premiere_id
GROUP BY mp.nom;
```

---

# 22. Requête métier réelle (GLPI)

Coût total par catégorie.

```sql id="3g13wx"
SELECT
categorie,
SUM(montant)
FROM cout
GROUP BY categorie;
```

---

# 23. Sous-requête vs Jointure

Souvent :

Mauvais :

```sql id="7nr4q5"
SELECT *
FROM voyage
WHERE chauffeur_id IN
(
SELECT id
FROM chauffeur
);
```

---

Préférer :

```sql id="mh85qj"
SELECT *
FROM voyage v
INNER JOIN chauffeur c
ON v.chauffeur_id=c.id;
```

---

# 24. Ordre logique d'exécution

```sql id="6e8np5"
SELECT
...
FROM
...
JOIN
...
WHERE
...
GROUP BY
...
HAVING
...
ORDER BY
...
LIMIT
...
```

Ordre réel :

```text id="2qu7r5"
1. FROM
2. JOIN
3. WHERE
4. GROUP BY
5. HAVING
6. SELECT
7. ORDER BY
8. LIMIT
```

---

# 25. Ce qu'un développeur Spring Boot doit maîtriser

Obligatoire :

✔ INNER JOIN

✔ LEFT JOIN

✔ GROUP BY

✔ HAVING

✔ CASE WHEN

✔ SUM

✔ COUNT

✔ AVG

✔ Sous-requêtes

✔ EXISTS

✔ VIEW

✔ INDEX

✔ Optimisation

---

# Les requêtes que tu utiliseras le plus

En entreprise :

```sql id="a5qpm5"
INNER JOIN
```

```sql id="n8r4v5"
LEFT JOIN
```

```sql id="p3fdmv"
GROUP BY
```

```sql id="v8cbv5"
COUNT
```

```sql id="2kzzjv"
SUM
```

```sql id="h1a7mr"
CASE WHEN
```

```sql id="b9m5kn"
ORDER BY
```

```sql id="k3fyhc"
LIMIT
```

Si tu maîtrises les trois documents SQL (Fondamental, Avancé et Expert), tu disposes déjà du niveau SQL utilisé dans la majorité des projets Spring Boot, Java Backend et Data Analysis.
