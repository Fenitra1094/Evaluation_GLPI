# SQL AVANCÉ (MariaDB)

## GROUP BY, HAVING, CASE WHEN, Sous-requêtes, UNION et Fonctions

---

# 1. Introduction

Le SQL fondamental permet de lire et modifier des données.

Le SQL avancé permet :

* faire des statistiques
* regrouper des données
* créer des catégories
* effectuer des calculs
* construire des tableaux de bord
* préparer des données pour Spring Boot

---

Nous utiliserons la table suivante :

```sql id="x1mq7e"
CREATE TABLE voyage (
    id INT,
    ville_depart VARCHAR(100),
    ville_arrivee VARCHAR(100),
    prix DECIMAL(10,2),
    nb_passagers INT,
    date_voyage DATE
);
```

Exemple :

| id | ville_depart | ville_arrivee | prix  | nb_passagers |
| -- | ------------ | ------------- | ----- | ------------ |
| 1  | Tana         | Majunga       | 50000 | 20           |
| 2  | Tana         | Majunga       | 50000 | 25           |
| 3  | Tana         | Toamasina     | 40000 | 30           |
| 4  | Fianarantsoa | Tana          | 35000 | 15           |

---

# 2. GROUP BY

Permet de regrouper plusieurs lignes.

---

## Exemple simple

```sql id="95t2ma"
SELECT ville_depart
FROM voyage
GROUP BY ville_depart;
```

Résultat :

| ville_depart |
| ------------ |
| Tana         |
| Fianarantsoa |

---

## Compter par ville

```sql id="j57uz6"
SELECT ville_depart,
       COUNT(*) AS total
FROM voyage
GROUP BY ville_depart;
```

Résultat :

| ville_depart | total |
| ------------ | ----- |
| Tana         | 3     |
| Fianarantsoa | 1     |

---

# 3. SUM + GROUP BY

Total des passagers.

```sql id="c34klj"
SELECT ville_depart,
       SUM(nb_passagers) AS total_passagers
FROM voyage
GROUP BY ville_depart;
```

Résultat :

| ville_depart | total_passagers |
| ------------ | --------------- |
| Tana         | 75              |
| Fianarantsoa | 15              |

---

# 4. AVG + GROUP BY

Moyenne.

```sql id="yepg2w"
SELECT ville_depart,
       AVG(prix) AS moyenne
FROM voyage
GROUP BY ville_depart;
```

---

# 5. MIN + GROUP BY

```sql id="73c1u8"
SELECT ville_depart,
       MIN(prix)
FROM voyage
GROUP BY ville_depart;
```

---

# 6. MAX + GROUP BY

```sql id="uvg0wd"
SELECT ville_depart,
       MAX(prix)
FROM voyage
GROUP BY ville_depart;
```

---

# 7. HAVING

HAVING filtre les groupes.

WHERE filtre les lignes.

---

## Exemple

```sql id="t49rk8"
SELECT ville_depart,
       COUNT(*)
FROM voyage
GROUP BY ville_depart
HAVING COUNT(*) > 1;
```

Résultat :

| ville_depart | count |
| ------------ | ----- |
| Tana         | 3     |

---

# Différence WHERE / HAVING

## WHERE

Avant GROUP BY

```sql id="2ep3wv"
SELECT *
FROM voyage
WHERE prix > 40000;
```

---

## HAVING

Après GROUP BY

```sql id="sckxxg"
SELECT ville_depart,
       COUNT(*)
FROM voyage
GROUP BY ville_depart
HAVING COUNT(*) > 2;
```

---

# 8. CASE WHEN

Equivalent du if / else.

---

## Exemple simple

```sql id="5a8t6x"
SELECT id,
       prix,
       CASE
           WHEN prix >= 50000 THEN 'Cher'
           ELSE 'Normal'
       END AS categorie
FROM voyage;
```

Résultat :

| id | prix  | categorie |
| -- | ----- | --------- |
| 1  | 50000 | Cher      |
| 4  | 35000 | Normal    |

---

## Plusieurs conditions

```sql id="dhmq2v"
SELECT prix,
CASE
    WHEN prix >= 60000 THEN 'VIP'
    WHEN prix >= 40000 THEN 'Standard'
    ELSE 'Economique'
END AS type_voyage
FROM voyage;
```

---

# 9. CASE + SUM

Très utilisé dans les statistiques.

```sql id="7vgrqt"
SELECT
SUM(
CASE
WHEN prix >= 50000
THEN 1
ELSE 0
END
) AS nb_voyages_chers
FROM voyage;
```

---

# 10. Sous-requête (Subquery)

Une requête dans une requête.

---

## Exemple

Prix supérieur à la moyenne.

```sql id="yx5e5m"
SELECT *
FROM voyage
WHERE prix >
(
    SELECT AVG(prix)
    FROM voyage
);
```

---

# Fonctionnement

Étape 1 :

```sql id="7zuw5x"
SELECT AVG(prix)
FROM voyage;
```

Résultat :

```text id="c7pj4a"
43750
```

Étape 2 :

```sql id="7mwyjq"
SELECT *
FROM voyage
WHERE prix > 43750;
```

---

# 11. Sous-requête avec IN

```sql id="xq7m4z"
SELECT *
FROM voyage
WHERE ville_depart IN
(
    SELECT ville_depart
    FROM voyage
    WHERE prix > 45000
);
```

---

# 12. Sous-requête avec NOT IN

```sql id="18fzv2"
SELECT *
FROM voyage
WHERE ville_depart NOT IN
(
    SELECT ville_depart
    FROM voyage
    WHERE prix > 45000
);
```

---

# 13. EXISTS

Vérifie si au moins une ligne existe.

```sql id="uvc8es"
SELECT *
FROM voyage v
WHERE EXISTS
(
    SELECT 1
    FROM voyage v2
    WHERE v2.ville_depart = v.ville_depart
);
```

---

# 14. NOT EXISTS

```sql id="stns8n"
SELECT *
FROM voyage v
WHERE NOT EXISTS
(
    SELECT 1
    FROM voyage v2
    WHERE v2.id <> v.id
);
```

---

# 15. UNION

Fusionne plusieurs SELECT.

---

## Exemple

```sql id="zd36x4"
SELECT ville_depart
FROM voyage

UNION

SELECT ville_arrivee
FROM voyage;
```

Les doublons sont supprimés.

---

# 16. UNION ALL

Conserve les doublons.

```sql id="ix5wzw"
SELECT ville_depart
FROM voyage

UNION ALL

SELECT ville_arrivee
FROM voyage;
```

---

# 17. Fonction LENGTH

Longueur d'un texte.

```sql id="n7pjpu"
SELECT nom,
       LENGTH(nom)
FROM voyageur;
```

---

# 18. Fonction UPPER

Majuscules.

```sql id="t7fy95"
SELECT UPPER(nom)
FROM voyageur;
```

---

# 19. Fonction LOWER

Minuscules.

```sql id="vsj7jm"
SELECT LOWER(nom)
FROM voyageur;
```

---

# 20. CONCAT

Concaténation.

```sql id="gf5dpg"
SELECT CONCAT(ville_depart,
              ' -> ',
              ville_arrivee)
FROM voyage;
```

Résultat :

```text id="y4vwn4"
Tana -> Majunga
```

---

# 21. ROUND

Arrondir.

```sql id="tlfc2d"
SELECT ROUND(AVG(prix),2)
FROM voyage;
```

---

# 22. CEIL

Arrondi supérieur.

```sql id="m74o72"
SELECT CEIL(45.2);
```

Résultat :

```text id="rjlwm5"
46
```

---

# 23. FLOOR

Arrondi inférieur.

```sql id="1ngt7t"
SELECT FLOOR(45.9);
```

Résultat :

```text id="1uj8vl"
45
```

---

# 24. CURRENT_DATE

Date actuelle.

```sql id="n5vupf"
SELECT CURRENT_DATE();
```

---

# 25. CURRENT_TIMESTAMP

Date + heure.

```sql id="p8w4tp"
SELECT CURRENT_TIMESTAMP();
```

---

# 26. YEAR

```sql id="0pb9jl"
SELECT YEAR(date_voyage)
FROM voyage;
```

---

# 27. MONTH

```sql id="b9qio9"
SELECT MONTH(date_voyage)
FROM voyage;
```

---

# 28. DAY

```sql id="7mrr26"
SELECT DAY(date_voyage)
FROM voyage;
```

---

# 29. Statistique réelle

Total des passagers par ville.

```sql id="j9cl4r"
SELECT ville_depart,
       SUM(nb_passagers) total
FROM voyage
GROUP BY ville_depart;
```

---

# 30. Tableau de bord réel

Nombre de voyages par mois.

```sql id="2e6pdj"
SELECT MONTH(date_voyage),
       COUNT(*)
FROM voyage
GROUP BY MONTH(date_voyage);
```

---

# 31. Requête très utilisée dans Spring Boot

```sql id="uj7y9v"
SELECT ville_depart,
       COUNT(*) nb,
       SUM(nb_passagers) total_passagers,
       AVG(prix) prix_moyen
FROM voyage
GROUP BY ville_depart
HAVING COUNT(*) > 1
ORDER BY total_passagers DESC;
```

---

# À maîtriser avant les jointures

* GROUP BY
* HAVING
* COUNT
* SUM
* AVG
* MIN
* MAX
* CASE WHEN
* Sous-requêtes
* EXISTS
* NOT EXISTS
* UNION
* UNION ALL
* CONCAT
* LENGTH
* UPPER
* LOWER
* ROUND
* CEIL
* FLOOR
* YEAR
* MONTH
* DAY
* CURRENT_DATE
* CURRENT_TIMESTAMP

Lorsque tu maîtrises ce document, tu es déjà capable de construire la majorité des requêtes utilisées dans les projets Spring Boot.
