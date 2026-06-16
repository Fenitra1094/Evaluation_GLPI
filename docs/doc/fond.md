# javascript-fondamentaux.md

# JavaScript Fondamentaux

Version : ES6+

---

# TABLE DES MATIÈRES

1. Introduction
2. Variables
3. Types de données
4. Conversion de types
5. Opérateurs
6. Conditions
7. Boucles
8. Fonctions
9. Scope
10. Hoisting
11. Tableaux
12. Objets
13. Destructuring
14. Spread Operator
15. Rest Operator
16. Template Literals
17. Valeurs Truthy et Falsy
18. Méthodes utiles
19. Exercices
20. Mots-clés pour CTRL+F

---

# INTRODUCTION

JavaScript est un langage :

* Interprété
* Dynamique
* Orienté objet
* Multi-paradigme
* Utilisé côté navigateur et serveur

Exemple :

```js
console.log("Bonjour JavaScript");
```

---

# VARIABLES

## var

```js
var nom = "Jean";
```

Peut être redéclarée.

```js
var age = 20;
var age = 25;
```

Portée : fonction.

---

## let

```js
let age = 20;
```

Peut être modifiée.

```js
age = 21;
```

Portée : bloc.

```js
if(true){
    let x = 10;
}

console.log(x);
```

Erreur.

---

## const

```js
const PI = 3.14;
```

Impossible de réassigner :

```js
PI = 5;
```

Erreur.

---

# TYPES DE DONNÉES

## String

```js
let nom = "Jean";
```

```js
let ville = 'Paris';
```

---

## Number

```js
let age = 20;
let prix = 19.99;
```

---

## Boolean

```js
let actif = true;
let admin = false;
```

---

## Undefined

```js
let test;

console.log(test);
```

Résultat :

```js
undefined
```

---

## Null

```js
let valeur = null;
```

---

## Symbol

```js
const id = Symbol();
```

---

## BigInt

```js
const grandNombre = 999999999999999999999n;
```

---

# TYPEOF

```js
typeof "bonjour"
```

Résultat :

```js
string
```

Exemples :

```js
typeof 5
typeof true
typeof {}
typeof []
typeof null
```

Attention :

```js
typeof null
```

Retourne :

```js
object
```

Historique du langage.

---

# CONVERSION DE TYPES

## String vers Number

```js
Number("123")
```

```js
parseInt("123")
```

```js
parseFloat("12.5")
```

---

## Number vers String

```js
String(123)
```

```js
(123).toString()
```

---

## Boolean

```js
Boolean(1)
```

Résultat :

```js
true
```

---

# OPÉRATEURS

## Addition

```js
5 + 3
```

---

## Soustraction

```js
5 - 3
```

---

## Multiplication

```js
5 * 3
```

---

## Division

```js
5 / 3
```

---

## Modulo

```js
5 % 2
```

Résultat :

```js
1
```

---

## Exponentiation

```js
2 ** 3
```

Résultat :

```js
8
```

---

# OPÉRATEURS DE COMPARAISON

## ==

```js
5 == "5"
```

Résultat :

```js
true
```

Conversion automatique.

---

## ===

```js
5 === "5"
```

Résultat :

```js
false
```

Toujours privilégier.

---

## !=

```js
5 != 6
```

---

## !==

```js
5 !== "5"
```

---

## >

```js
10 > 5
```

---

## <

```js
5 < 10
```

---

## >=

```js
5 >= 5
```

---

## <=

```js
5 <= 10
```

---

# OPÉRATEURS LOGIQUES

## AND

```js
true && true
```

---

## OR

```js
true || false
```

---

## NOT

```js
!true
```

Résultat :

```js
false
```

---

# CONDITIONS

## if

```js
if(age >= 18){
    console.log("Majeur");
}
```

---

## if else

```js
if(age >= 18){
    console.log("Majeur");
}else{
    console.log("Mineur");
}
```

---

## else if

```js
if(note >= 16){
    console.log("Très bien");
}else if(note >= 10){
    console.log("Passable");
}else{
    console.log("Échec");
}
```

---

# OPÉRATEUR TERNAIRE

Syntaxe :

```js
condition ? valeur1 : valeur2
```

Exemple :

```js
let message =
    age >= 18
    ? "Majeur"
    : "Mineur";
```

---

# SWITCH

```js
switch(jour){

    case 1:
        console.log("Lundi");
        break;

    case 2:
        console.log("Mardi");
        break;

    default:
        console.log("Inconnu");
}
```

---

# BOUCLES

## for

```js
for(let i = 0; i < 5; i++){
    console.log(i);
}
```

---

## while

```js
let i = 0;

while(i < 5){
    console.log(i);
    i++;
}
```

---

## do while

```js
let i = 0;

do{
    console.log(i);
    i++;
}
while(i < 5);
```

---

## break

```js
for(let i=0;i<10;i++){

    if(i===5){
        break;
    }

}
```

---

## continue

```js
for(let i=0;i<5;i++){

    if(i===2){
        continue;
    }

    console.log(i);

}
```

---

# FOR OF

Parcourt les valeurs.

```js
const notes = [10,12,15];

for(const note of notes){
    console.log(note);
}
```

---

# FOR IN

Parcourt les propriétés.

```js
const personne = {
    nom:"Jean",
    age:20
};

for(const cle in personne){
    console.log(cle);
}
```

---

# FONCTIONS

## Déclaration

```js
function addition(a,b){
    return a+b;
}
```

---

## Appel

```js
addition(2,3);
```

---

## Paramètres par défaut

```js
function saluer(nom="Anonyme"){
    console.log(nom);
}
```

---

## Fonction anonyme

```js
const addition = function(a,b){
    return a+b;
};
```

---

## Arrow Function

```js
const addition = (a,b)=>{
    return a+b;
};
```

---

Version courte :

```js
const addition = (a,b)=>a+b;
```

---

# RETURN

```js
function carre(x){
    return x*x;
}
```

---

# SCOPE

## Global

```js
let nom = "Jean";
```

Accessible partout.

---

## Local

```js
function test(){

    let age = 20;

}
```

Accessible uniquement dans la fonction.

---

## Scope de bloc

```js
if(true){

    let x = 10;

}
```

---

# HOISTING

JavaScript remonte certaines déclarations.

```js
bonjour();

function bonjour(){
    console.log("Salut");
}
```

Fonctionne.

---

Exemple problématique :

```js
console.log(age);

let age = 20;
```

Erreur.

---

# TABLEAUX

## Création

```js
const fruits = [
    "Pomme",
    "Banane",
    "Orange"
];
```

---

## Accès

```js
fruits[0]
```

---

## Taille

```js
fruits.length
```

---

## push

```js
fruits.push("Kiwi");
```

---

## pop

```js
fruits.pop();
```

---

## shift

```js
fruits.shift();
```

---

## unshift

```js
fruits.unshift("Mangue");
```

---

## includes

```js
fruits.includes("Banane");
```

---

## indexOf

```js
fruits.indexOf("Banane");
```

---

# FOREACH

```js
fruits.forEach(
    fruit=>{
        console.log(fruit);
    }
);
```

---

# MAP

```js
const nombres = [1,2,3];

const doubles =
    nombres.map(
        x=>x*2
    );
```

Résultat :

```js
[2,4,6]
```

---

# FILTER

```js
const nombres = [1,2,3,4,5];

const pairs =
    nombres.filter(
        x=>x%2===0
    );
```

Résultat :

```js
[2,4]
```

---

# FIND

```js
const resultat =
    nombres.find(
        x=>x===3
    );
```

---

# REDUCE

```js
const somme =
    nombres.reduce(
        (acc,val)=>acc+val,
        0
    );
```

---

# OBJETS

## Création

```js
const personne = {
    nom:"Jean",
    age:20
};
```

---

## Lecture

```js
personne.nom
```

---

```js
personne["nom"]
```

---

## Modification

```js
personne.age = 21;
```

---

## Ajout

```js
personne.ville = "Paris";
```

---

## Suppression

```js
delete personne.ville;
```

---

# OBJECT.KEYS

```js
Object.keys(personne);
```

---

# OBJECT.VALUES

```js
Object.values(personne);
```

---

# OBJECT.ENTRIES

```js
Object.entries(personne);
```

---

# DESTRUCTURING

```js
const personne = {
    nom:"Jean",
    age:20
};

const {nom,age} = personne;
```

---

# DESTRUCTURING TABLEAU

```js
const notes = [10,15,20];

const [a,b,c] = notes;
```

---

# SPREAD OPERATOR

```js
const a = [1,2];
const b = [...a,3,4];
```

Résultat :

```js
[1,2,3,4]
```

---

# COPIE D'OBJET

```js
const copie = {
    ...personne
};
```

---

# REST OPERATOR

```js
function somme(...nombres){

    console.log(nombres);

}
```

---

# TEMPLATE LITERALS

```js
const nom = "Jean";

console.log(
    `Bonjour ${nom}`
);
```

---

# TRUTHY

Considérés comme vrais :

```js
"bonjour"
[]
{}
1
100
```

---

# FALSY

Considérés comme faux :

```js
false
0
""
null
undefined
NaN
```

---

# OPTIONAL CHAINING

```js
user?.adresse?.ville
```

Évite les erreurs.

---

# NULLISH COALESCING

```js
const nom =
    user.nom ?? "Anonyme";
```

---

# MÉTHODES UTILES

## Array.isArray

```js
Array.isArray(data)
```

---

## Math.random

```js
Math.random()
```

---

## Math.floor

```js
Math.floor(10.9)
```

---

## Math.ceil

```js
Math.ceil(10.1)
```

---

## Math.round

```js
Math.round(10.5)
```

---

# EXERCICE 1

Calculer la somme :

```js
const notes = [10,12,15,18];

let somme = 0;

for(const note of notes){
    somme += note;
}

console.log(somme);
```

---

# EXERCICE 2

Compter les nombres pairs.

```js
const nombres = [1,2,3,4,5,6];

const pairs =
    nombres.filter(
        x=>x%2===0
    );

console.log(
    pairs.length
);
```

---

# MOTS CLÉS CTRL+F

var
let
const
string
number
boolean
undefined
null
symbol
bigint
typeof
conversion
parseInt
parseFloat
Number
String
if
else
switch
for
while
do while
break
continue
function
return
scope
hoisting
array
push
pop
shift
unshift
foreach
map
filter
find
reduce
object
destructuring
spread
rest
template literals
truthy
falsy
optional chaining
nullish coalescing
Math
Array

# FIN
