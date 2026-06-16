# javascript-dom-browser.md

# JavaScript DOM & Browser API

Version ES6+

---

# TABLE DES MATIÈRES

1. Introduction
2. DOM
3. Sélection d'éléments
4. Manipulation HTML
5. Manipulation CSS
6. Création d'éléments
7. Suppression d'éléments
8. Navigation dans le DOM
9. Événements
10. Formulaires
11. Fetch API
12. JSON
13. LocalStorage
14. SessionStorage
15. Cookies
16. Timers
17. Clipboard API
18. Drag & Drop
19. Intersection Observer
20. Mutation Observer
21. Resize Observer
22. URL API
23. History API
24. Geolocation API
25. Notifications API
26. WebSocket
27. File API
28. Bonnes pratiques
29. Mots-clés CTRL+F

---

# INTRODUCTION

Le navigateur fournit plusieurs APIs JavaScript :

* DOM API
* Fetch API
* Storage API
* History API
* WebSocket API
* File API
* Notification API
* Clipboard API

---

# DOM

DOM signifie :

```txt
Document Object Model
```

Le HTML devient un arbre manipulable en JavaScript.

Exemple HTML :

```html
<h1 id="title">Bonjour</h1>
```

JavaScript :

```js
const titre =
    document.getElementById("title");
```

---

# SÉLECTION D'ÉLÉMENTS

## getElementById

```js
const element =
    document.getElementById("title");
```

---

## getElementsByClassName

```js
const elements =
    document.getElementsByClassName("card");
```

---

## getElementsByTagName

```js
const elements =
    document.getElementsByTagName("div");
```

---

## querySelector

Premier élément trouvé.

```js
const element =
    document.querySelector(".card");
```

---

## querySelectorAll

Tous les éléments.

```js
const elements =
    document.querySelectorAll(".card");
```

---

# MODIFICATION HTML

## textContent

```js
element.textContent =
    "Bonjour";
```

Affiche uniquement du texte.

---

## innerHTML

```js
element.innerHTML =
    "<b>Bonjour</b>";
```

Interprète le HTML.

---

## innerText

```js
element.innerText =
    "Bonjour";
```

Respecte le rendu visuel.

---

# ATTRIBUTS

## Lire

```js
element.getAttribute("href");
```

---

## Modifier

```js
element.setAttribute(
    "href",
    "https://google.com"
);
```

---

## Supprimer

```js
element.removeAttribute(
    "disabled"
);
```

---

# CLASSLIST

## Ajouter

```js
element.classList.add(
    "active"
);
```

---

## Supprimer

```js
element.classList.remove(
    "active"
);
```

---

## Toggle

```js
element.classList.toggle(
    "active"
);
```

---

## Vérifier

```js
element.classList.contains(
    "active"
);
```

---

# STYLE CSS

## Modifier

```js
element.style.color =
    "red";
```

---

```js
element.style.fontSize =
    "20px";
```

---

## Plusieurs styles

```js
Object.assign(
    element.style,
    {
        width:"200px",
        height:"100px"
    }
);
```

---

# CRÉATION D'ÉLÉMENTS

## createElement

```js
const div =
    document.createElement(
        "div"
    );
```

---

## Ajouter du contenu

```js
div.textContent =
    "Bonjour";
```

---

## Ajouter dans le DOM

```js
document.body.appendChild(
    div
);
```

---

# APPEND

```js
parent.append(
    enfant
);
```

---

# PREPEND

```js
parent.prepend(
    enfant
);
```

---

# REMOVE

```js
element.remove();
```

---

# REPLACEWITH

```js
ancien.replaceWith(
    nouveau
);
```

---

# NAVIGATION DOM

## Parent

```js
element.parentElement
```

---

## Enfants

```js
element.children
```

---

## Premier enfant

```js
element.firstElementChild
```

---

## Dernier enfant

```js
element.lastElementChild
```

---

## Frère suivant

```js
element.nextElementSibling
```

---

## Frère précédent

```js
element.previousElementSibling
```

---

# ÉVÉNEMENTS

## click

```js
button.addEventListener(
    "click",
    () => {

        console.log("Click");

    }
);
```

---

## dblclick

```js
button.addEventListener(
    "dblclick",
    ()=>{
    }
);
```

---

## mouseenter

```js
element.addEventListener(
    "mouseenter",
    ()=>{
    }
);
```

---

## mouseleave

```js
element.addEventListener(
    "mouseleave",
    ()=>{
    }
);
```

---

## keydown

```js
document.addEventListener(
    "keydown",
    (event)=>{

        console.log(event.key);

    }
);
```

---

## keyup

```js
document.addEventListener(
    "keyup",
    ()=>{
    }
);
```

---

# OBJET EVENT

```js
button.addEventListener(
    "click",
    (event)=>{

        console.log(event);

    }
);
```

---

## event.target

```js
event.target
```

---

## preventDefault

```js
event.preventDefault();
```

---

## stopPropagation

```js
event.stopPropagation();
```

---

# FORMULAIRES

HTML :

```html
<form id="form">
    <input id="nom">
</form>
```

---

JavaScript :

```js
const form =
    document.getElementById(
        "form"
    );

form.addEventListener(
    "submit",
    (event)=>{

        event.preventDefault();

    }
);
```

---

# INPUT

```js
input.value
```

---

## Input Event

```js
input.addEventListener(
    "input",
    ()=>{
    }
);
```

---

## Change Event

```js
input.addEventListener(
    "change",
    ()=>{
    }
);
```

---

# FETCH API

API moderne pour les requêtes HTTP.

---

# GET

```js
const response =
    await fetch("/users");

const data =
    await response.json();
```

---

# POST

```js
await fetch(
    "/users",
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            nom:"Jean"
        })
    }
);
```

---

# PUT

```js
await fetch(
    "/users/1",
    {
        method:"PUT"
    }
);
```

---

# DELETE

```js
await fetch(
    "/users/1",
    {
        method:"DELETE"
    }
);
```

---

# JSON

## Objet vers JSON

```js
JSON.stringify(objet);
```

---

## JSON vers Objet

```js
JSON.parse(json);
```

---

# LOCAL STORAGE

Persistant.

---

## Sauvegarder

```js
localStorage.setItem(
    "nom",
    "Jean"
);
```

---

## Lire

```js
localStorage.getItem(
    "nom"
);
```

---

## Supprimer

```js
localStorage.removeItem(
    "nom"
);
```

---

## Tout supprimer

```js
localStorage.clear();
```

---

# OBJETS DANS LOCALSTORAGE

Sauvegarde :

```js
localStorage.setItem(
    "user",
    JSON.stringify(user)
);
```

---

Lecture :

```js
const user =
JSON.parse(
    localStorage.getItem(
        "user"
    )
);
```

---

# SESSION STORAGE

Même API.

---

```js
sessionStorage.setItem(
    "token",
    "abc"
);
```

---

# COOKIES

Créer :

```js
document.cookie =
    "nom=Jean";
```

---

Lire :

```js
document.cookie
```

---

# SETTIMEOUT

```js
setTimeout(
    ()=>{

        console.log("Bonjour");

    },
    1000
);
```

---

# SETINTERVAL

```js
setInterval(
    ()=>{

        console.log("Tick");

    },
    1000
);
```

---

# CLEARINTERVAL

```js
const id =
    setInterval(()=>{},1000);

clearInterval(id);
```

---

# CLIPBOARD API

Copier :

```js
await navigator.clipboard.writeText(
    "Bonjour"
);
```

---

Lire :

```js
const texte =
await navigator.clipboard.readText();
```

---

# DRAG AND DROP

## draggable

```html
<div draggable="true">
</div>
```

---

## dragstart

```js
element.addEventListener(
    "dragstart",
    ()=>{
    }
);
```

---

## dragover

```js
zone.addEventListener(
    "dragover",
    event=>{

        event.preventDefault();

    }
);
```

---

## drop

```js
zone.addEventListener(
    "drop",
    ()=>{
    }
);
```

---

# INTERSECTION OBSERVER

Détecter la visibilité.

```js
const observer =
new IntersectionObserver(
    entries=>{

        entries.forEach(
            entry=>{

                if(entry.isIntersecting){

                }

            }
        );

    }
);
```

---

Observation :

```js
observer.observe(
    element
);
```

---

# MUTATION OBSERVER

Détecte les modifications du DOM.

```js
const observer =
new MutationObserver(
    mutations=>{

        console.log(
            mutations
        );

    }
);
```

---

# RESIZE OBSERVER

Détecte les changements de taille.

```js
const observer =
new ResizeObserver(
    entries=>{

        console.log(entries);

    }
);
```

---

# URL API

Créer :

```js
const url =
new URL(
    window.location.href
);
```

---

Lire paramètre :

```js
url.searchParams.get(
    "id"
);
```

---

# HISTORY API

Retour :

```js
history.back();
```

---

Avancer :

```js
history.forward();
```

---

Ajouter URL :

```js
history.pushState(
    {},
    "",
    "/dashboard"
);
```

---

# GEOLOCATION API

```js
navigator.geolocation
.getCurrentPosition(
    position=>{

        console.log(
            position.coords.latitude
        );

    }
);
```

---

# NOTIFICATION API

Permission :

```js
await Notification.requestPermission();
```

---

Notification :

```js
new Notification(
    "Bonjour"
);
```

---

# WEBSOCKET

Connexion :

```js
const socket =
new WebSocket(
    "ws://localhost:8080"
);
```

---

Message :

```js
socket.send(
    "Bonjour"
);
```

---

Réception :

```js
socket.onmessage =
(event)=>{

    console.log(
        event.data
    );

};
```

---

# FILE API

## Input fichier

```html
<input
type="file"
id="file"
/>
```

---

Lecture :

```js
const file =
input.files[0];
```

---

FileReader :

```js
const reader =
new FileReader();
```

---

Lire texte :

```js
reader.readAsText(
    file
);
```

---

Lire image :

```js
reader.readAsDataURL(
    file
);
```

---

# WINDOW OBJECT

```js
window.innerWidth
```

---

```js
window.innerHeight
```

---

```js
window.location.href
```

---

```js
window.scrollY
```

---

# DOCUMENT READY

```js
document.addEventListener(
    "DOMContentLoaded",
    ()=>{

    }
);
```

---

# BONNES PRATIQUES

Utiliser :

```js
querySelector
```

au lieu de :

```js
getElementsByTagName
```

quand possible.

---

Toujours :

```js
addEventListener
```

au lieu de :

```js
onclick
```

---

Toujours gérer :

```js
try/catch
```

avec Fetch.

---

Éviter :

```js
innerHTML
```

avec des données utilisateur.

---

Préférer :

```js
textContent
```

pour éviter les injections XSS.

---

# MOTS-CLÉS CTRL+F

DOM

querySelector

querySelectorAll

getElementById

innerHTML

textContent

classList

style

appendChild

append

prepend

remove

replaceWith

parentElement

children

click

dblclick

mouseenter

mouseleave

keydown

keyup

event

target

preventDefault

stopPropagation

form

input

submit

fetch

GET

POST

PUT

DELETE

JSON

localStorage

sessionStorage

cookie

setTimeout

setInterval

clipboard

drag and drop

intersection observer

mutation observer

resize observer

URL API

history API

geolocation

notification

websocket

file api

FileReader

window

document

DOMContentLoaded

XSS

# FIN
