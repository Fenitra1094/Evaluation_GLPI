# javascript-avance.md

# JavaScript Avancé

Version ES6+ à ES2025

---

# TABLE DES MATIÈRES

1. Introduction
2. Fonctions avancées
3. Closures
4. Callbacks
5. Promises
6. Async / Await
7. Gestion des erreurs
8. Event Loop
9. Classes
10. Héritage
11. Prototypes
12. Encapsulation
13. Getters et Setters
14. Modules ES6
15. Import / Export
16. Collections avancées
17. Set
18. Map
19. WeakMap
20. WeakSet
21. Générateurs
22. Itérateurs
23. Symbol
24. BigInt
25. Programmation fonctionnelle
26. Optimisations
27. Bonnes pratiques
28. Mots-clés CTRL+F

---

# INTRODUCTION

Cette partie couvre les concepts avancés de JavaScript modernes utilisés dans :

* Vue.js
* React
* Angular
* Node.js
* Express
* NestJS
* Electron

---

# FONCTIONS AVANCÉES

## Fonction comme variable

```js
const direBonjour = function () {
    console.log("Bonjour");
};
```

---

## Fonction dans une variable

```js
const addition = (a, b) => a + b;
```

---

## Fonction passée en paramètre

```js
function executer(callback) {
    callback();
}

executer(() => {
    console.log("Exécuté");
});
```

---

# FONCTIONS D'ORDRE SUPÉRIEUR

Une fonction qui :

* reçoit une fonction
* retourne une fonction

Exemple :

```js
function multiplier(facteur) {

    return function(nombre) {
        return nombre * facteur;
    };

}

const doubler = multiplier(2);

console.log(doubler(5));
```

Résultat :

```txt
10
```

---

# CLOSURES

Une closure permet à une fonction de conserver l'accès aux variables de son contexte.

```js
function compteur() {

    let valeur = 0;

    return function() {
        valeur++;
        return valeur;
    };

}

const c = compteur();

console.log(c());
console.log(c());
console.log(c());
```

Résultat :

```txt
1
2
3
```

---

# CALLBACKS

## Callback simple

```js
function traitement(callback) {

    console.log("Début");

    callback();

    console.log("Fin");

}

traitement(() => {
    console.log("Milieu");
});
```

---

## Callback asynchrone

```js
setTimeout(() => {
    console.log("Bonjour");
}, 1000);
```

---

# CALLBACK HELL

Exemple à éviter :

```js
fonction1(() => {

    fonction2(() => {

        fonction3(() => {

            fonction4();

        });

    });

});
```

Solution :

* Promises
* Async/Await

---

# PROMISES

Une Promise représente une opération future.

États :

* pending
* fulfilled
* rejected

---

## Création

```js
const promesse = new Promise(
    (resolve, reject) => {

        const succes = true;

        if (succes) {
            resolve("Succès");
        } else {
            reject("Erreur");
        }

    }
);
```

---

## Then

```js
promesse.then(resultat => {
    console.log(resultat);
});
```

---

## Catch

```js
promesse.catch(erreur => {
    console.log(erreur);
});
```

---

## Finally

```js
promesse.finally(() => {
    console.log("Terminé");
});
```

---

# CHAÎNAGE DE PROMISES

```js
fetch("/users")
    .then(r => r.json())
    .then(data => {

        console.log(data);

    })
    .catch(error => {

        console.error(error);

    });
```

---

# PROMISE.ALL

Toutes les promesses doivent réussir.

```js
Promise.all([
    fetch("/users"),
    fetch("/tickets")
])
.then(resultats => {

    console.log(resultats);

});
```

---

# PROMISE.ALLSETTLED

Attend toutes les promesses.

```js
Promise.allSettled([
    promise1,
    promise2,
    promise3
]);
```

---

# PROMISE.RACE

Prend la première terminée.

```js
Promise.race([
    promise1,
    promise2
]);
```

---

# ASYNC / AWAIT

## Fonction async

```js
async function charger() {

}
```

---

## Await

```js
async function charger() {

    const response =
        await fetch("/api");

}
```

---

## Exemple complet

```js
async function getUsers() {

    try {

        const response =
            await fetch("/users");

        const data =
            await response.json();

        console.log(data);

    }
    catch(error) {

        console.error(error);

    }

}
```

---

# GESTION DES ERREURS

## Try

```js
try {

}
catch(error) {

}
```

---

## Exemple

```js
try {

    const x = JSON.parse("{");

}
catch(error) {

    console.error(error);

}
```

---

## Finally

```js
try {

}
catch(error) {

}
finally {

    console.log("Toujours exécuté");

}
```

---

# THROW

Créer une erreur.

```js
throw new Error("Erreur personnalisée");
```

---

# EVENT LOOP

Sujet très important en entretien.

JavaScript est :

```txt
Single Thread
```

Mais peut gérer :

```txt
Asynchronous Tasks
```

Grâce à :

* Call Stack
* Web APIs
* Callback Queue
* Event Loop

---

# EXEMPLE EVENT LOOP

```js
console.log("A");

setTimeout(() => {
    console.log("B");
}, 0);

console.log("C");
```

Résultat :

```txt
A
C
B
```

---

# CLASSES

## Déclaration

```js
class Personne {

    constructor(nom) {

        this.nom = nom;

    }

}
```

---

## Création

```js
const p =
    new Personne("Jean");
```

---

# MÉTHODES

```js
class Personne {

    constructor(nom) {

        this.nom = nom;

    }

    parler() {

        console.log(this.nom);

    }

}
```

---

# THIS

```js
this.nom
```

Référence l'objet courant.

---

# HÉRITAGE

```js
class Personne {

    constructor(nom) {

        this.nom = nom;

    }

}
```

```js
class Employe extends Personne {

}
```

---

# SUPER

```js
class Employe extends Personne {

    constructor(nom, poste) {

        super(nom);

        this.poste = poste;

    }

}
```

---

# POLYMORPHISME

```js
class Animal {

    parler() {
        console.log("Son");
    }

}

class Chien extends Animal {

    parler() {
        console.log("Wouf");
    }

}
```

---

# PROTOTYPES

Tout objet JavaScript possède un prototype.

```js
const utilisateur = {};
```

---

Vérification :

```js
Object.getPrototypeOf(utilisateur);
```

---

Ajout dynamique :

```js
Personne.prototype.saluer =
function() {

    console.log("Bonjour");

};
```

---

# GETTERS

```js
class User {

    get nom() {

        return this._nom;

    }

}
```

---

# SETTERS

```js
class User {

    set nom(valeur) {

        this._nom = valeur;

    }

}
```

---

# ENCAPSULATION

## Champs privés

```js
class Compte {

    #solde = 0;

}
```

---

Méthodes :

```js
class Compte {

    #solde = 0;

    deposer(montant) {

        this.#solde += montant;

    }

}
```

---

# MODULES ES6

## Export

```js
export function addition() {

}
```

---

## Export multiple

```js
export const nom = "Jean";
export const age = 20;
```

---

## Export Default

```js
export default class User {

}
```

---

# IMPORT

```js
import User from "./User.js";
```

---

## Import multiple

```js
import {
    nom,
    age
}
from "./config.js";
```

---

## Import alias

```js
import {
    nom as username
}
from "./config.js";
```

---

# SET

Collection sans doublon.

```js
const nombres =
    new Set();
```

---

Ajout :

```js
nombres.add(10);
```

---

Suppression :

```js
nombres.delete(10);
```

---

Vérification :

```js
nombres.has(10);
```

---

# MAP

Paire clé / valeur.

```js
const utilisateurs =
    new Map();
```

---

Ajout :

```js
utilisateurs.set(
    "id",
    1
);
```

---

Lecture :

```js
utilisateurs.get("id");
```

---

# WEAKMAP

Version optimisée de Map.

Utilisée pour :

* cache
* mémoire

---

# WEAKSET

Version optimisée de Set.

---

# SYMBOL

Valeur unique.

```js
const id =
    Symbol();
```

---

```js
const id2 =
    Symbol();
```

---

Comparaison :

```js
id === id2
```

Résultat :

```txt
false
```

---

# BIGINT

Pour les très grands nombres.

```js
const nombre =
    999999999999999999n;
```

---

# GÉNÉRATEURS

Fonctions spéciales.

```js
function* compteur() {

    yield 1;
    yield 2;
    yield 3;

}
```

---

Utilisation :

```js
const gen =
    compteur();

gen.next();
```

---

# ITÉRATEURS

```js
const tableau =
    [1,2,3];

const iterator =
    tableau[Symbol.iterator]();
```

---

# PROGRAMMATION FONCTIONNELLE

Principes :

* fonctions pures
* immutabilité
* composition

---

## Fonction pure

```js
function addition(a,b) {

    return a+b;

}
```

---

## Fonction impure

```js
let total = 0;

function addition(x) {

    total += x;

}
```

---

# IMMUTABILITÉ

Éviter :

```js
user.nom = "Jean";
```

Préférer :

```js
const nouveauUser = {

    ...user,
    nom:"Jean"

};
```

---

# OPTIMISATIONS

## Utiliser const

```js
const nom = "Jean";
```

---

## Éviter les boucles inutiles

Mauvais :

```js
for(...) {
}
```

quand :

```js
array.find(...)
```

suffit.

---

## Préférer Map

Pour les recherches rapides.

---

# BONNES PRATIQUES

Toujours :

```js
===
```

Jamais :

```js
==
```

---

Utiliser :

```js
async / await
```

---

Découper les fonctions.

---

Nommer correctement les variables.

---

Limiter les effets de bord.

---

# QUESTIONS D'ENTRETIEN

## Différence entre var et let ?

Portée.

---

## Différence entre == et === ?

Conversion implicite.

---

## Qu'est-ce qu'une closure ?

Fonction qui conserve son contexte.

---

## Qu'est-ce qu'une Promise ?

Objet représentant une opération asynchrone.

---

## Qu'est-ce que l'Event Loop ?

Mécanisme de gestion de l'asynchrone.

---

# MOTS-CLÉS CTRL+F

closure

callback

callback hell

promise

then

catch

finally

async

await

event loop

call stack

queue

class

constructor

extends

super

prototype

getter

setter

private field

encapsulation

inheritance

polymorphism

module

import

export

default export

set

map

weakmap

weakset

generator

iterator

symbol

bigint

functional programming

immutability

pure function

optimization

error handling

throw

try catch

# FIN
