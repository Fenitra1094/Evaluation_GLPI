# VUE.JS & JAVASCRIPT MODERNE

## Guide complet pour développeur Spring Boot + Vue.js

---

# 1. JavaScript : Les bases des tableaux

Très important car Vue travaille énormément avec les tableaux.

Exemple :

```js
const etudiants = [
    { id: 1, nom: "Fenitra", note: 15 },
    { id: 2, nom: "Jean", note: 12 },
    { id: 3, nom: "Sarah", note: 18 }
]
```

---

# 2. map()

Transforme chaque élément.

---

## Exemple

```js
const noms = etudiants.map(e => e.nom)

console.log(noms)
```

Résultat :

```js
[
 "Fenitra",
 "Jean",
 "Sarah"
]
```

---

## Cas réel Vue

```js
const options = produits.map(p => ({
    value: p.id,
    label: p.nom
}))
```

Très utilisé dans les select.

---

# 3. filter()

Filtre les éléments.

---

## Exemple

```js
const admis = etudiants.filter(
    e => e.note >= 10
)
```

Résultat :

```js
[
 { id:1, nom:"Fenitra", note:15 },
 { id:2, nom:"Jean", note:12 },
 { id:3, nom:"Sarah", note:18 }
]
```

---

## Cas réel

Produits disponibles :

```js
const disponibles = produits.filter(
    p => p.quantite > 0
)
```

---

# 4. find()

Retourne le premier élément trouvé.

```js
const etudiant = etudiants.find(
    e => e.id === 2
)
```

Résultat :

```js
{
 id:2,
 nom:"Jean"
}
```

---

# 5. findIndex()

Retourne l'indice.

```js
const index = etudiants.findIndex(
    e => e.id === 2
)
```

Résultat :

```js
1
```

---

# 6. some()

Teste si au moins un élément respecte une condition.

```js
const existe = etudiants.some(
    e => e.note < 10
)
```

Résultat :

```js
false
```

---

# 7. every()

Teste si tous respectent une condition.

```js
const tousAdmis = etudiants.every(
    e => e.note >= 10
)
```

---

# 8. reduce()

Très important.

Permet de transformer un tableau en une seule valeur.

---

## Somme

```js
const total = etudiants.reduce(
    (somme, e) => somme + e.note,
    0
)
```

Résultat :

```js
45
```

---

## Cas GLPI

```js
const totalGlpi = costs.reduce(
    (sum, c) => sum + c.amount,
    0
)
```

---

## Cas Coffee-Cacao

```js
const stockTotal = stocks.reduce(
    (sum, s) => sum + s.quantite,
    0
)
```

---

# 9. sort()

Tri.

---

Croissant

```js
etudiants.sort(
    (a,b) => a.note - b.note
)
```

---

Décroissant

```js
etudiants.sort(
    (a,b) => b.note - a.note
)
```

---

# 10. forEach()

Boucle.

```js
etudiants.forEach(e => {
    console.log(e.nom)
})
```

---

# 11. Spread (...)

Copie d'objet.

```js
const copie = {
    ...etudiant
}
```

---

Fusion

```js
const personne = {
    ...user,
    age:20
}
```

---

# 12. Destructuring

```js
const { nom, note } = etudiant
```

Equivalent :

```js
const nom = etudiant.nom
const note = etudiant.note
```

---

# 13. ref()

Base de Vue.

```js
import { ref } from 'vue'

const compteur = ref(0)
```

---

Modification

```js
compteur.value++
```

---

# 14. reactive()

Objet réactif.

```js
const utilisateur = reactive({
    nom:"Fenitra",
    age:20
})
```

---

# 15. computed()

Extrêmement important.

Permet de calculer automatiquement une valeur.

---

Exemple

```js
const prix = ref(1000)
const quantite = ref(3)

const total = computed(
    () => prix.value * quantite.value
)
```

---

Lorsque :

```js
quantite.value = 5
```

Vue recalcule automatiquement :

```js
5000
```

---

# 16. Quand utiliser computed ?

Utiliser lorsque :

* calcul automatique
* filtrage
* total
* statistiques

---

Exemple

```js
const totalStock = computed(() =>
    stocks.value.reduce(
        (s,x) => s + x.quantite,
        0
    )
)
```

---

# 17. watch()

Observe une valeur.

```js
watch(prix, (newValue) => {

    console.log(newValue)

})
```

---

Exécution :

```js
prix.value = 1000
```

↓

```js
1000
```

---

# 18. watchEffect()

Réagit automatiquement.

```js
watchEffect(() => {

    console.log(prix.value)

})
```

---

# 19. onMounted()

Très utilisé.

Equivalent du chargement de page.

```js
onMounted(() => {

    chargerProduits()

})
```

---

Utilisé pour :

* appel API
* chargement initial
* statistiques

---

# 20. onUnmounted()

Quand le composant disparaît.

```js
onUnmounted(() => {

    clearInterval(timer)

})
```

---

# 21. v-model

Liaison automatique.

```html
<input v-model="nom">
```

---

Sans v-model :

```html
<input
:value="nom"
@input="nom = $event.target.value">
```

---

# 22. v-if

Affichage conditionnel.

```html
<div v-if="age >= 18">

Majeur

</div>
```

---

# 23. v-else

```html
<div v-else>

Mineur

</div>
```

---

# 24. v-show

Cache sans supprimer du DOM.

```html
<div v-show="visible">
```

---

# 25. v-for

Boucle.

```html
<tr
v-for="p in produits"
:key="p.id"
>
```

---

Avec index

```html
<tr
v-for="(p,index) in produits"
:key="p.id"
>
```

---

# 26. @click

```html
<button
@click="save()"
>
```

---

# 27. @change

```html
<select
@change="charger()"
>
```

---

# 28. @input

```html
<input
@input="calculer()"
>
```

---

# 29. @submit.prevent

Empêche le rechargement.

```html
<form
@submit.prevent="save"
>
```

---

# 30. Props

Parent → Enfant

```js
defineProps({
    produit:Object
})
```

---

# 31. Emit

Enfant → Parent

```js
const emit = defineEmits([
    'save'
])
```

---

Déclenchement

```js
emit('save')
```

---

# 32. Appel API

```js
const response =
await axios.get(
    '/api/produits'
)
```

---

POST

```js
await axios.post(
    '/api/produits',
    produit
)
```

---

PUT

```js
await axios.put(
    '/api/produits/1',
    produit
)
```

---

DELETE

```js
await axios.delete(
    '/api/produits/1'
)
```

---

# 33. Erreur fréquente

Mauvais

```js
const total =
stocks.reduce(...)
```

Lorsque stocks vaut :

```js
undefined
```

Erreur :

```text
Cannot read properties of undefined
```

---

Solution

```js
const total =
(stocks || []).reduce(...)
```

---

# 34. Ce qu'un développeur Vue doit maîtriser

JavaScript :

✔ map()

✔ filter()

✔ reduce()

✔ find()

✔ findIndex()

✔ some()

✔ every()

✔ sort()

✔ spread (...)

✔ destructuring

---

Vue :

✔ ref()

✔ reactive()

✔ computed()

✔ watch()

✔ watchEffect()

✔ onMounted()

✔ onUnmounted()

✔ v-model

✔ v-if

✔ v-show

✔ v-for

✔ props

✔ emits

✔ axios

---

# Les plus utilisés en entreprise

Tous les jours :

```js
map()
filter()
reduce()
computed()
onMounted()
v-for
v-model
axios
```

Ce sont les notions que tu rencontres constamment dans les projets Vue + Spring Boot comme GLPI, Coffee-Cacao ou Taxi-Brousse.
