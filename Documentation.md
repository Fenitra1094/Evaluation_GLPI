# Documentation Vue: input et recuperation apres clic

Cette note explique 2 choses simples mais tres utiles dans Vue.js:

1. comment saisir une valeur dans un input
2. comment recuperer cette valeur apres un clic sur un bouton

L'exemple ci-dessous utilise le principe de liaison de donnees de Vue avec `v-model` et la gestion d'evenement avec `@click`.

## 1. Faire un input

Lier l'input avec `v-model`.

### Exemple minimal

```vue
<script setup>
import { ref } from 'vue'

const nom = ref('')
</script>

<template>
  <input v-model="nom" type="text" placeholder="Entrez votre nom" />
</template>
```

### A retenir

- `ref('')` cree la variable
- `v-model="nom"` relie le champ
- la valeur se met a jour toute seule

## 2. Recuperer apres clic

Utiliser `@click` pour lire la valeur.

### Exemple complet

```vue
<script setup>
import { ref } from 'vue'

const nom = ref('')
const message = ref('')

function recupererNom() {
  if (nom.value.trim() === '') {
    message.value = 'Veuillez saisir un nom avant de cliquer.'
    return
  }

  message.value = `Bonjour ${nom.value}`
}
</script>

<template>
  <div>
    <label for="nom">Nom</label>
    <input
      id="nom"
      v-model="nom"
      type="text"
      placeholder="Entrez votre nom"
    />

    <button type="button" @click="recupererNom">
      Valider
    </button>

    <p>{{ message }}</p>
  </div>
</template>
```

### A retenir

- `nom.value` lit la valeur
- `trim()` evite les espaces seuls
- `message.value` affiche le resultat

## 3. Fonctionnement

- `v-model` relie le champ a la variable
- `@click` lance la fonction
- la fonction lit la valeur et fait l'action voulue

## 4. Plusieurs inputs

Creer une variable par champ.

```vue
<script setup>
import { ref } from 'vue'

const nom = ref('')
const email = ref('')

function envoyerFormulaire() {
  console.log('Nom:', nom.value)
  console.log('Email:', email.value)
}
</script>

<template>
  <input v-model="nom" type="text" placeholder="Nom" />
  <input v-model="email" type="email" placeholder="Email" />
  <button type="button" @click="envoyerFormulaire">Envoyer</button>
</template>
```

## 5. Erreurs frequentes

### Oublier `ref`

`const nom = ''` ne marche pas. Il faut `ref('')` ou `reactive(...)`.

### Oublier `.value` dans le script

Dans le script: `nom.value`. Dans le template: `{{ nom }}`.

### Oublier `@click`

Sans `@click`, rien ne se passe.

### Faire un bouton sans `type="button"`

Dans un formulaire, mettez `type="button"` si vous ne voulez pas soumettre.

```html
<button type="button" @click="recupererNom">Valider</button>
```

## 6. A retenir

- `v-model` pour l'input
- `@click` pour le bouton
- `nom.value` pour lire la valeur

## 7. Exemple simple

Gardez cette structure:

```vue
<script setup>
import { ref } from 'vue'

const valeur = ref('')

function actionBouton() {
  console.log(valeur.value)
}
</script>

<template>
  <input v-model="valeur" />
  <button type="button" @click="actionBouton">Cliquer</button>
</template>
```

Cette base suffit pour la plupart des petits formulaires Vue.

---

# Comment faire une redirection avec Vue Router

Cette section explique comment rediriger l'utilisateur vers une autre page après une action (ex: après une connexion).

## 1. Importer useRouter

Dans `<script setup>`, il faut importer `useRouter` de `vue-router`:

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
```

## 2. Utiliser router.push()

Pour rediriger vers une page:

```javascript
router.push('/')  // Va à la page d'accueil
router.push('/computers')  // Va à la page des ordinateurs
```

## 3. Exemple complet: formulaire de connexion

```vue
<template>
  <div class="login">
    <h3>Entrer votre code</h3>
    <input v-model="code" type="text" placeholder="Code" />
    <button @click="connexion">Connecter</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const code = ref('')

function connexion() {
  if (code.value.trim() === '') {
    alert('Veuillez entrer un code valide')
    return
  }
  
  // Redirection après connexion réussie
  router.push('/')
}
</script>
```

## 4. Routes disponibles

Vérifiez toujours les routes disponibles dans `src/router/index.js`:

- `/` → Page d'accueil
- `/computers` → Liste des ordinateurs GLPI
- `/local-computers` → Mes ordinateurs locaux
- `/reset` → Réinitialisation

## 5. Différence: this.$router vs useRouter()

### ❌ ANCIEN (Options API)
```javascript
this.$router.push('/accueil')
```

### ✅ NOUVEAU (Composition API avec <script setup>)
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/accueil')
```

Toujours utiliser `useRouter()` avec `<script setup>`.

## 6. Redirection avec paramètres

Si vous avez besoin de passer des données:

```javascript
// Redirection simple
router.push('/computers')

// Avec paramètres dans l'URL
router.push({ name: 'computers', params: { id: 123 } })

// Avec query
router.push({ path: '/computers', query: { search: 'Dell' } })
```

## 7. Points clés à retenir

- ✅ Importer `useRouter` de `vue-router`
- ✅ Appeler `useRouter()` pour obtenir l'instance du routeur
- ✅ Utiliser `router.push(route)` pour rediriger
- ✅ Vérifier que la route existe dans le routeur
- ❌ Ne pas utiliser `this.$router` dans `<script setup>`