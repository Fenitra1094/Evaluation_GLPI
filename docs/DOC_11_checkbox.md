# DOC_11_checkbox.md

# Checkbox dans Vue 3

Cette note explique :

* créer une checkbox
* récupérer sa valeur
* gérer plusieurs checkbox
* récupérer les éléments cochés

## 1. Checkbox simple

### Exemple

```vue
<script setup>
import { ref } from 'vue'

const accepteConditions = ref(false)
</script>

<template>
  <label>
    <input
      v-model="accepteConditions"
      type="checkbox"
    />
    J'accepte les conditions
  </label>

  <p>{{ accepteConditions }}</p>
</template>
```

## Résultat

Non cochée :

```js
false
```

Cochée :

```js
true
```

---

## 2. Récupérer après clic

```vue
<script setup>
import { ref } from 'vue'

const accepteConditions = ref(false)

function valider() {
  console.log(accepteConditions.value)
}
</script>

<template>
  <input
    v-model="accepteConditions"
    type="checkbox"
  />

  <button @click="valider">
    Valider
  </button>
</template>
```

---

## 3. Plusieurs checkbox

### Exemple

```vue
<script setup>
import { ref } from 'vue'

const selected = ref([])
</script>

<template>
  <label>
    <input
      v-model="selected"
      type="checkbox"
      value="Ordinateur"
    />
    Ordinateur
  </label>

  <label>
    <input
      v-model="selected"
      type="checkbox"
      value="Imprimante"
    />
    Imprimante
  </label>

  <label>
    <input
      v-model="selected"
      type="checkbox"
      value="Écran"
    />
    Écran
  </label>

  <p>{{ selected }}</p>
</template>
```

---

## Résultat

Si l'utilisateur coche :

Ordinateur + Écran

```js
[
  "Ordinateur",
  "Écran"
]
```

---

## 4. Envoyer les éléments cochés

```js
function envoyer() {
  console.log(selected.value)
}
```

Résultat :

```js
[
  "Ordinateur",
  "Écran"
]
```

---

## 5. Vérifier si un élément est coché

```js
selected.value.includes('Ordinateur')
```

Résultat :

```js
true
```

---

## À retenir

Checkbox unique :

```js
const checked = ref(false)
```

Plusieurs checkbox :

```js
const selected = ref([])
```

Lire :

```js
selected.value
```


# Checkbox avec récupération des IDs

## Exemple de données

```js
const users = [
  { id: 1, nom: 'Jean' },
  { id: 2, nom: 'Paul' },
  { id: 3, nom: 'Marie' }
]
```

## Affichage des checkbox

```vue
<script setup>
import { ref } from 'vue'

const selectedUsers = ref([])

const users = [
  { id: 1, nom: 'Jean' },
  { id: 2, nom: 'Paul' },
  { id: 3, nom: 'Marie' }
]
</script>

<template>

  <div
    v-for="user in users"
    :key="user.id"
  >
    <label>
      <input
        v-model="selectedUsers"
        type="checkbox"
        :value="user.id"
      />

      {{ user.nom }}
    </label>
  </div>

</template>
```

## Résultat

Si Jean et Marie sont cochés :

```js
selectedUsers.value
```

donne :

```js
[1, 3]
```

On récupère les IDs.

---

## Envoyer à l'API

```js
async function save() {

  console.log(selectedUsers.value)

}
```

Résultat :

```js
[1, 3]
```

---

## Vérifier si un utilisateur est coché

```js
selectedUsers.value.includes(1)
```

Résultat :

```js
true
```

---

## Cas fréquent : employés sur un ticket

```js
const selectedEmployes = ref([])
```

```vue
<div
  v-for="employe in employes"
  :key="employe.id"
>

  <input
    v-model="selectedEmployes"
    type="checkbox"
    :value="employe.id"
  />

  {{ employe.nom }}

</div>
```

Si l'utilisateur coche :

* Employé 5
* Employé 7
* Employé 12

Alors :

```js
selectedEmployes.value
```

contient :

```js
[5, 7, 12]
```

---

## Transformer avant envoi

Si l'API veut :

```json
[
  { "id": 5 },
  { "id": 7 },
  { "id": 12 }
]
```

Faire :

```js
const payload = selectedEmployes.value.map(id => ({
  id
}))
```

Résultat :

```js
[
  { id: 5 },
  { id: 7 },
  { id: 12 }
]
```

---

## À retenir

Checkbox simple :

```js
const checked = ref(false)
```

Plusieurs checkbox :

```js
const selected = ref([])
```

Récupérer les IDs :

```vue
:value="item.id"
```

Lire :

```js
selected.value
```

Vérifier :

```js
selected.value.includes(id)
```
 
