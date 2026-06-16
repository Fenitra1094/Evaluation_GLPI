Documentation Vue.js & JavaScript en local
Je vais créer plusieurs fichiers .md complets et détaillés. Voici la structure :

text

docs/
├── vue-fondamentaux.md
├── vue-composants.md
├── vue-directives.md
├── vue-reactivite.md
├── vue-router.md
├── vue-pinia.md
├── vue-composables.md
├── javascript-fondamentaux.md
├── javascript-avance.md
└── javascript-async.md
📄 Fichier 1 : vue-fondamentaux.md
Markdown

# VUE.JS - FONDAMENTAUX
<!-- TAG: vue, fondamentaux, instance, options api, composition api, setup, template -->

## TABLE DES MATIÈRES
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Instance Vue](#instance-vue)
4. [Options API vs Composition API](#options-api-vs-composition-api)
5. [Template Syntax](#template-syntax)
6. [Data Binding](#data-binding)
7. [Méthodes](#méthodes)
8. [Computed Properties](#computed-properties)
9. [Watchers](#watchers)
10. [Lifecycle Hooks](#lifecycle-hooks)

---

## INTRODUCTION
<!-- TAG: introduction, vue3, framework, spa -->

Vue.js est un framework JavaScript progressif pour construire des interfaces utilisateur.
- **Version actuelle** : Vue 3
- **Paradigme** : Réactif, basé sur les composants
- **Site officiel** : https://vuejs.org

---

## INSTALLATION
<!-- TAG: installation, vite, cdn, npm, create-vue -->

### Via CDN (prototype rapide)
```html
<!-- Vue 3 CDN -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp } = Vue

  createApp({
    data() {
      return {
        message: 'Bonjour Vue!'
      }
    }
  }).mount('#app')
</script>
Via Vite + create-vue (recommandé)
Bash

# Créer un nouveau projet
npm create vue@latest mon-projet

# Options proposées :
# ✔ Add TypeScript? No
# ✔ Add JSX Support? No
# ✔ Add Vue Router? Yes
# ✔ Add Pinia? Yes
# ✔ Add Vitest? No
# ✔ Add ESLint? Yes

cd mon-projet
npm install
npm run dev
Via Vite manuellement
Bash

npm create vite@latest mon-projet -- --template vue
cd mon-projet
npm install
npm run dev
Structure d'un projet Vue (Vite)
text

mon-projet/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/          # Images, fonts, CSS globaux
│   ├── components/      # Composants réutilisables
│   ├── views/           # Pages (avec Vue Router)
│   ├── stores/          # État global (Pinia)
│   ├── composables/     # Logique réutilisable
│   ├── router/          # Configuration des routes
│   ├── App.vue          # Composant racine
│   └── main.js          # Point d'entrée
├── index.html
├── vite.config.js
└── package.json
INSTANCE VUE
<!-- TAG: createapp, mount, instance, app -->
Créer et monter une application
JavaScript

// main.js
import { createApp } from 'vue'
import App from './App.vue'

// Créer l'instance
const app = createApp(App)

// Monter l'application sur un élément DOM
app.mount('#app')
Configuration globale
JavaScript

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Composant global
app.component('MonComposant', MonComposant)

// Directive globale
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// Plugin
app.use(MonPlugin, { option: 'valeur' })

// Variable globale accessible dans tous les composants
app.config.globalProperties.$monApi = monService

// Gestion des erreurs globale
app.config.errorHandler = (err, instance, info) => {
  console.error('Erreur Vue:', err)
}

app.mount('#app')
OPTIONS API VS COMPOSITION API
<!-- TAG: options api, composition api, setup, ref, reactive -->
Options API (Vue 2 style, toujours valide en Vue 3)
vue

<script>
export default {
  name: 'MonComposant',
  
  // Données réactives
  data() {
    return {
      compteur: 0,
      nom: 'Alice',
      utilisateur: {
        age: 25,
        email: 'alice@example.com'
      }
    }
  },
  
  // Propriétés calculées
  computed: {
    nomEnMajuscule() {
      return this.nom.toUpperCase()
    },
    doubleCompteur() {
      return this.compteur * 2
    }
  },
  
  // Méthodes
  methods: {
    incrementer() {
      this.compteur++
    },
    saluer() {
      alert(`Bonjour ${this.nom}!`)
    }
  },
  
  // Observateurs
  watch: {
    compteur(nouvelleValeur, ancienneValeur) {
      console.log(`Compteur: ${ancienneValeur} → ${nouvelleValeur}`)
    }
  },
  
  // Cycle de vie
  mounted() {
    console.log('Composant monté!')
  }
}
</script>
Composition API (Vue 3, recommandée)
vue

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

// Données réactives
const compteur = ref(0)
const nom = ref('Alice')
const utilisateur = reactive({
  age: 25,
  email: 'alice@example.com'
})

// Propriétés calculées
const nomEnMajuscule = computed(() => nom.value.toUpperCase())
const doubleCompteur = computed(() => compteur.value * 2)

// Méthodes (simples fonctions)
function incrementer() {
  compteur.value++
}

function saluer() {
  alert(`Bonjour ${nom.value}!`)
}

// Observateurs
watch(compteur, (nouvelleValeur, ancienneValeur) => {
  console.log(`Compteur: ${ancienneValeur} → ${nouvelleValeur}`)
})

// Cycle de vie
onMounted(() => {
  console.log('Composant monté!')
})
</script>
TEMPLATE SYNTAX
<!-- TAG: template, interpolation, mustache, expressions -->
Interpolation de texte
vue

<template>
  <!-- Interpolation basique avec moustaches {{ }} -->
  <p>{{ message }}</p>
  <p>{{ 'Texte statique' }}</p>
  
  <!-- Expressions JavaScript valides -->
  <p>{{ compteur + 1 }}</p>
  <p>{{ ok ? 'OUI' : 'NON' }}</p>
  <p>{{ message.split('').reverse().join('') }}</p>
  <p>{{ Math.random() * 100 }}</p>
  
  <!-- Appel de méthode -->
  <p>{{ formaterDate(maDate) }}</p>
  
  <!-- HTML brut (attention XSS!) -->
  <p v-html="htmlContent"></p>
  
  <!-- Texte brut (pas d'interpolation) -->
  <p v-text="message"></p>
</template>
Attributs dynamiques
vue

<template>
  <!-- Binding d'attribut avec v-bind: ou : -->
  <img v-bind:src="imageUrl" v-bind:alt="imageAlt">
  <img :src="imageUrl" :alt="imageAlt">
  
  <!-- ID dynamique -->
  <div :id="'element-' + id"></div>
  
  <!-- Classe dynamique -->
  <div :class="maClasse"></div>
  
  <!-- Style dynamique -->
  <div :style="monStyle"></div>
  
  <!-- Binding de plusieurs attributs à la fois -->
  <div v-bind="objetAttributs"></div>
  <!-- équivalent à : -->
  <div :id="objetAttributs.id" :class="objetAttributs.class"></div>
  
  <!-- Attribut booléen -->
  <button :disabled="estDesactive">Cliquer</button>
  <input :required="estRequis">
</template>

<script setup>
import { ref } from 'vue'

const imageUrl = ref('/images/photo.jpg')
const imageAlt = ref('Ma photo')
const id = ref(42)
const maClasse = ref('rouge bold')
const monStyle = ref({ color: 'red', fontSize: '16px' })
const estDesactive = ref(true)
const estRequis = ref(false)

const objetAttributs = ref({
  id: 'mon-div',
  class: 'container',
  'data-info': 'valeur'
})
</script>
DATA BINDING
<!-- TAG: binding, v-model, two-way, input, form -->
Binding unidirectionnel (parent → enfant)
vue

<template>
  <!-- : est le raccourci de v-bind: -->
  <p :class="couleur">Texte coloré</p>
  <input :value="nom" @input="nom = $event.target.value">
</template>
Binding bidirectionnel avec v-model
vue

<template>
  <!-- Input texte -->
  <input v-model="texte" placeholder="Saisir du texte">
  <p>Vous avez tapé : {{ texte }}</p>
  
  <!-- Textarea -->
  <textarea v-model="description"></textarea>
  
  <!-- Checkbox -->
  <input type="checkbox" v-model="accepte">
  <label>J'accepte les CGU : {{ accepte }}</label>
  
  <!-- Checkbox multiples → tableau -->
  <input type="checkbox" value="vue" v-model="frameworks">
  <input type="checkbox" value="react" v-model="frameworks">
  <input type="checkbox" value="angular" v-model="frameworks">
  <p>Sélectionnés: {{ frameworks }}</p>
  
  <!-- Radio -->
  <input type="radio" value="homme" v-model="genre">
  <input type="radio" value="femme" v-model="genre">
  <p>Genre: {{ genre }}</p>
  
  <!-- Select -->
  <select v-model="ville">
    <option value="">Choisir une ville</option>
    <option value="paris">Paris</option>
    <option value="lyon">Lyon</option>
    <option value="marseille">Marseille</option>
  </select>
  
  <!-- Select multiple -->
  <select v-model="villes" multiple>
    <option value="paris">Paris</option>
    <option value="lyon">Lyon</option>
  </select>
  
  <!-- Modificateurs v-model -->
  <!-- .lazy : mise à jour au blur/change (pas à chaque frappe) -->
  <input v-model.lazy="texte">
  
  <!-- .number : convertit en nombre -->
  <input v-model.number="age" type="number">
  
  <!-- .trim : supprime les espaces -->
  <input v-model.trim="nom">
</template>

<script setup>
import { ref } from 'vue'

const texte = ref('')
const description = ref('')
const accepte = ref(false)
const frameworks = ref([])
const genre = ref('')
const ville = ref('')
const villes = ref([])
const age = ref(0)
const nom = ref('')
</script>
MÉTHODES
<!-- TAG: methods, fonctions, events, handlers -->
Définir et utiliser des méthodes
vue

<template>
  <button @click="direBonjour">Dire bonjour</button>
  <button @click="incrementer(5)">+5</button>
  <button @click="gererEvenement($event)">Avec event</button>
  
  <!-- Méthodes inline -->
  <button @click="compteur++">Incrément direct</button>
  
  <!-- Plusieurs gestionnaires -->
  <button @click="methodeUn(); methodeDeux()">Les deux</button>
</template>

<script setup>
import { ref } from 'vue'

const compteur = ref(0)

function direBonjour() {
  alert('Bonjour!')
}

function incrementer(valeur) {
  compteur.value += valeur
}

function gererEvenement(event) {
  console.log('Événement:', event)
  console.log('Cible:', event.target)
}

function methodeUn() { console.log('Un') }
function methodeDeux() { console.log('Deux') }
</script>
COMPUTED PROPERTIES
<!-- TAG: computed, calculé, cache, getter, setter -->
Propriétés calculées (avec mise en cache)
vue

<script setup>
import { ref, computed } from 'vue'

const prenom = ref('Alice')
const nom = ref('Martin')
const items = ref([1, 2, 3, 4, 5, 6])

// Computed simple (getter seulement)
const nomComplet = computed(() => {
  return `${prenom.value} ${nom.value}`
})

// Computed avec getter ET setter
const nomCompletAvecSetter = computed({
  get() {
    return `${prenom.value} ${nom.value}`
  },
  set(nouvelleValeur) {
    const parties = nouvelleValeur.split(' ')
    prenom.value = parties[0]
    nom.value = parties[1] || ''
  }
})

// Utilisation du setter :
// nomCompletAvecSetter.value = 'Bob Dupont'
// → prenom = 'Bob', nom = 'Dupont'

// Computed pour filtrer une liste
const itemsPairs = computed(() => {
  return items.value.filter(item => item % 2 === 0)
})

// Computed complexe
const statistiques = computed(() => {
  const total = items.value.reduce((acc, val) => acc + val, 0)
  const moyenne = total / items.value.length
  return {
    total,
    moyenne: moyenne.toFixed(2),
    count: items.value.length
  }
})
</script>

<template>
  <p>Nom complet : {{ nomComplet }}</p>
  <p>Items pairs : {{ itemsPairs }}</p>
  <p>Stats : {{ statistiques }}</p>
</template>
Computed vs Méthodes (différence importante)
vue

<script setup>
import { ref, computed } from 'vue'

const compteur = ref(0)

// ✅ COMPUTED : mis en cache, recalculé seulement si compteur change
const doubleComputed = computed(() => {
  console.log('Computed recalculé')
  return compteur.value * 2
})

// ❌ MÉTHODE : recalculée à CHAQUE rendu
function doubleMethode() {
  console.log('Méthode appelée')
  return compteur.value * 2
}
</script>
WATCHERS
<!-- TAG: watch, watcheffect, observer, réactif -->
watch - Observer des changements
vue

<script setup>
import { ref, reactive, watch, watchEffect } from 'vue'

const compteur = ref(0)
const nom = ref('Alice')
const utilisateur = reactive({ age: 25, ville: 'Paris' })

// Watcher simple
watch(compteur, (nouvelleVal, ancienneVal) => {
  console.log(`compteur: ${ancienneVal} → ${nouvelleVal}`)
})

// Watcher avec options
watch(compteur, (nouvelleVal, ancienneVal) => {
  console.log('Changement détecté')
}, {
  immediate: true,    // Exécuté immédiatement au montage
  deep: true,         // Observer en profondeur
  once: true          // Observer une seule fois
})

// Observer un reactive (deep automatique)
watch(utilisateur, (val) => {
  console.log('Utilisateur changé:', val)
}, { deep: true })

// Observer une propriété spécifique d'un reactive
watch(() => utilisateur.age, (nouvelAge) => {
  console.log('Age changé:', nouvelAge)
})

// Observer plusieurs sources
watch([compteur, nom], ([newCount, newNom], [oldCount, oldNom]) => {
  console.log(`compteur: ${oldCount}→${newCount}, nom: ${oldNom}→${newNom}`)
})

// watchEffect : s'exécute immédiatement et suit les dépendances auto
const stop = watchEffect(() => {
  console.log(`Valeur actuelle: ${compteur.value}`)
  // Toutes les refs accédées ici sont automatiquement observées
})

// Arrêter un watcher manuellement
// stop()

// watchEffect avec nettoyage
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(compteur.value)
  }, 1000)
  
  // Nettoyage avant la prochaine exécution ou unmount
  onCleanup(() => {
    clearInterval(timer)
  })
})
</script>
LIFECYCLE HOOKS
<!-- TAG: lifecycle, cycle de vie, mounted, created, unmounted, beforemount -->
Tous les hooks de cycle de vie
vue

<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated
} from 'vue'

// PHASE DE CRÉATION (setup s'exécute ici)
// Équivalent à beforeCreate et created en Options API

// Avant le montage dans le DOM
onBeforeMount(() => {
  console.log('⏳ Avant montage - DOM pas encore disponible')
})

// Après le montage dans le DOM ✅ Le plus utilisé
onMounted(() => {
  console.log('✅ Monté - DOM disponible')
  // Ici : appels API, accès aux refs DOM, initialisation de bibliothèques
  // Exemple :
  // const data = await fetchData()
  // mapInstance = initMap()
})

// Avant une mise à jour du DOM
onBeforeUpdate(() => {
  console.log('⏳ Avant mise à jour')
})

// Après une mise à jour du DOM
onUpdated(() => {
  console.log('🔄 DOM mis à jour')
  // Attention : ne pas modifier le state ici (boucle infinie)
})

// Avant la destruction du composant
onBeforeUnmount(() => {
  console.log('⚠️ Avant destruction')
  // Nettoyage : event listeners, timers, connexions WebSocket
})

// Après la destruction
onUnmounted(() => {
  console.log('🗑️ Composant détruit')
  clearInterval(monTimer)
  socket.disconnect()
})

// Capture d'erreurs des composants enfants
onErrorCaptured((err, instance, info) => {
  console.error('Erreur capturée:', err)
  return false // Empêche la propagation
})

// Avec <KeepAlive> - composant réactivé
onActivated(() => {
  console.log('▶️ Composant activé')
})

// Avec <KeepAlive> - composant mis en veille
onDeactivated(() => {
  console.log('⏸️ Composant désactivé')
})
</script>
Diagramme du cycle de vie
text

App démarre
    │
    ▼
setup() ← beforeCreate + created (Options API)
    │
    ▼
onBeforeMount() ← template compilé, pas encore dans le DOM
    │
    ▼
onMounted() ← composant dans le DOM ✅
    │
    ▼ (si données changent)
onBeforeUpdate()
    │
    ▼
onUpdated() ← DOM mis à jour
    │
    ▼ (si composant retiré)
onBeforeUnmount()
    │
    ▼
onUnmounted() ← nettoyage final
text


---

## 📄 Fichier 2 : `vue-directives.md`

```markdown
# VUE.JS - DIRECTIVES
<!-- TAG: directives, v-if, v-for, v-show, v-bind, v-on, v-model, v-slot, custom directive -->

## TABLE DES MATIÈRES
1. [v-if / v-else-if / v-else](#v-if)
2. [v-show](#v-show)
3. [v-for](#v-for)
4. [v-bind (:)](#v-bind)
5. [v-on (@)](#v-on)
6. [v-model](#v-model)
7. [v-slot (#)](#v-slot)
8. [v-html et v-text](#v-html-v-text)
9. [v-pre et v-once et v-memo](#v-pre-v-once-v-memo)
10. [Directives personnalisées](#directives-personnalisees)

---

## V-IF / V-ELSE-IF / V-ELSE
<!-- TAG: v-if, v-else, v-else-if, conditionnel, affichage conditionnel -->

```vue
<template>
  <!-- v-if : retire/ajoute l'élément du DOM -->
  <div v-if="estConnecte">Bienvenue!</div>
  <div v-else>Veuillez vous connecter</div>
  
  <!-- v-else-if : condition intermédiaire -->
  <div v-if="note >= 90">Excellent</div>
  <div v-else-if="note >= 70">Bien</div>
  <div v-else-if="note >= 50">Passable</div>
  <div v-else>Insuffisant</div>
  
  <!-- v-if sur un groupe avec <template> (sans div supplémentaire) -->
  <template v-if="estAdmin">
    <h2>Panel Admin</h2>
    <p>Accès total</p>
    <button>Supprimer utilisateur</button>
  </template>
  
  <!-- ❌ v-if et v-for sur le même élément : ÉVITER -->
  <!-- v-if a la priorité sur v-for en Vue 3 -->
  
  <!-- ✅ Bonne pratique : v-for sur le parent -->
  <ul>
    <template v-for="item in items" :key="item.id">
      <li v-if="item.actif">{{ item.nom }}</li>
    </template>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const estConnecte = ref(true)
const estAdmin = ref(false)
const note = ref(85)
const items = ref([
  { id: 1, nom: 'Alice', actif: true },
  { id: 2, nom: 'Bob', actif: false },
  { id: 3, nom: 'Charlie', actif: true }
])
</script>
v-if vs v-show : quand utiliser quoi ?
text

v-if  → Retire l'élément du DOM (display:none n'est PAS utilisé)
        Coût : élevé à chaque toggle
        Utiliser quand : condition rarement vraie ou élément lourd

v-show → Garde l'élément dans le DOM (ajoute display:none)
         Coût : élevé au premier rendu, faible au toggle
         Utiliser quand : toggle fréquent (menu, modal, tabs)
V-SHOW
<!-- TAG: v-show, display, toggle, visible -->
vue

<template>
  <!-- v-show : garde dans le DOM, change display -->
  <div v-show="estVisible">
    Ce contenu est toujours dans le DOM
  </div>
  
  <button @click="estVisible = !estVisible">
    {{ estVisible ? 'Cacher' : 'Afficher' }}
  </button>
  
  <!-- Exemple pratique : menu déroulant -->
  <nav>
    <button @click="menuOuvert = !menuOuvert">Menu</button>
    <ul v-show="menuOuvert">
      <li><a href="/">Accueil</a></li>
      <li><a href="/apropos">À propos</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const estVisible = ref(true)
const menuOuvert = ref(false)
</script>
V-FOR
<!-- TAG: v-for, liste, tableau, array, key, iteration, boucle -->
vue

<template>
  <!-- Tableau simple -->
  <ul>
    <li v-for="fruit in fruits" :key="fruit">
      {{ fruit }}
    </li>
  </ul>
  
  <!-- Tableau avec index -->
  <ul>
    <li v-for="(fruit, index) in fruits" :key="index">
      {{ index + 1 }}. {{ fruit }}
    </li>
  </ul>
  
  <!-- Tableau d'objets -->
  <div v-for="user in utilisateurs" :key="user.id">
    <h3>{{ user.nom }}</h3>
    <p>Email: {{ user.email }}</p>
    <p>Âge: {{ user.age }}</p>
  </div>
  
  <!-- Objet (itère sur les valeurs) -->
  <ul>
    <li v-for="valeur in monObjet" :key="valeur">
      {{ valeur }}
    </li>
  </ul>
  
  <!-- Objet avec clé et index -->
  <ul>
    <li v-for="(valeur, cle, index) in monObjet" :key="cle">
      {{ index }}. {{ cle }}: {{ valeur }}
    </li>
  </ul>
  
  <!-- Plage numérique (1 à n) -->
  <span v-for="n in 10" :key="n">{{ n }} </span>
  <!-- Affiche : 1 2 3 4 5 6 7 8 9 10 -->
  
  <!-- v-for avec <template> (groupe sans élément wrapper) -->
  <table>
    <template v-for="user in utilisateurs" :key="user.id">
      <tr>
        <td>{{ user.nom }}</td>
        <td>{{ user.email }}</td>
      </tr>
      <tr v-if="user.note">
        <td colspan="2">Note: {{ user.note }}</td>
      </tr>
    </template>
  </table>
  
  <!-- v-for avec composant -->
  <MonComposant
    v-for="item in items"
    :key="item.id"
    :item="item"
    @supprimer="supprimerItem(item.id)"
  />
  
  <!-- Liste imbriquée -->
  <div v-for="categorie in categories" :key="categorie.id">
    <h2>{{ categorie.nom }}</h2>
    <ul>
      <li v-for="produit in categorie.produits" :key="produit.id">
        {{ produit.nom }} - {{ produit.prix }}€
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const fruits = ref(['Pomme', 'Banane', 'Orange', 'Fraise'])

const utilisateurs = ref([
  { id: 1, nom: 'Alice', email: 'alice@ex.com', age: 28 },
  { id: 2, nom: 'Bob', email: 'bob@ex.com', age: 32 },
  { id: 3, nom: 'Charlie', email: 'charlie@ex.com', age: 25 }
])

const monObjet = reactive({
  titre: 'Vue.js',
  version: '3.0',
  auteur: 'Evan You'
})

const categories = ref([
  {
    id: 1,
    nom: 'Fruits',
    produits: [
      { id: 11, nom: 'Pomme', prix: 1.5 },
      { id: 12, nom: 'Banane', prix: 0.8 }
    ]
  },
  {
    id: 2,
    nom: 'Légumes',
    produits: [
      { id: 21, nom: 'Carotte', prix: 0.5 },
      { id: 22, nom: 'Tomate', prix: 1.2 }
    ]
  }
])

function supprimerItem(id) {
  items.value = items.value.filter(i => i.id !== id)
}
</script>
Pourquoi la :key est OBLIGATOIRE
vue

<!-- ❌ Sans key : Vue peut faire des erreurs de mise à jour -->
<li v-for="item in items">{{ item.nom }}</li>

<!-- ✅ Avec key unique : Vue peut identifier chaque élément -->
<li v-for="item in items" :key="item.id">{{ item.nom }}</li>

<!-- ⚠️ Éviter d'utiliser l'index comme key si la liste peut être réordonnée -->
<li v-for="(item, index) in items" :key="index">{{ item.nom }}</li>
V-BIND
<!-- TAG: v-bind, binding, attributs, classe, style, dynamique -->
vue

<template>
  <!-- Syntaxe complète vs raccourci -->
  <img v-bind:src="imageUrl">
  <img :src="imageUrl">                   <!-- Raccourci recommandé -->
  
  <!-- ===== BINDING DE CLASSES ===== -->
  
  <!-- Objet : { 'nom-classe': condition } -->
  <div :class="{ active: estActif, 'text-red': aErreur }">
    Texte avec classes conditionnelles
  </div>
  
  <!-- Tableau de classes -->
  <div :class="[classeBase, classeTheme]">Texte</div>
  
  <!-- Tableau avec condition ternaire -->
  <div :class="[estActif ? 'active' : 'inactive', classeBase]">
    Texte
  </div>
  
  <!-- Mélange classe statique et dynamique -->
  <div class="container" :class="{ 'container--large': estGrand }">
    Contenu
  </div>
  
  <!-- Computed pour les classes complexes -->
  <div :class="classesComposant">Composant</div>
  
  <!-- ===== BINDING DE STYLES ===== -->
  
  <!-- Objet de style (camelCase) -->
  <div :style="{ color: couleurTexte, fontSize: tailleTexte + 'px' }">
    Texte stylé
  </div>
  
  <!-- Objet de style (kebab-case entre quotes) -->
  <div :style="{ 'background-color': couleurFond }">
    Fond coloré
  </div>
  
  <!-- Variable d'objet -->
  <div :style="monStyle">Texte</div>
  
  <!-- Tableau de styles (merge automatique) -->
  <div :style="[styleBase, styleTheme]">Texte</div>
  
  <!-- Préfixe auto-vendor -->
  <div :style="{ transform: 'rotate(45deg)' }">
    Vue ajoute -webkit- automatiquement si nécessaire
  </div>
  
  <!-- ===== AUTRES ATTRIBUTS ===== -->
  
  <!-- href dynamique -->
  <a :href="lienUrl" :target="ouvrirNouvelOnglet ? '_blank' : '_self'">
    Lien
  </a>
  
  <!-- disabled conditionnel -->
  <button :disabled="formulaireInvalide || enChargement">
    {{ enChargement ? 'Chargement...' : 'Envoyer' }}
  </button>
  
  <!-- src dynamique pour images -->
  <img :src="getImageUrl(produit.id)" :alt="produit.nom">
  
  <!-- data-attributes dynamiques -->
  <div :data-id="item.id" :data-type="item.type">Item</div>
  
  <!-- Binding d'un objet entier d'attributs -->
  <div v-bind="{ id: monId, class: maClasse, 'data-x': valeur }">
    Tous les attributs d'un coup
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const imageUrl = ref('/img/photo.jpg')
const estActif = ref(true)
const aErreur = ref(false)
const classeBase = ref('btn')
const classeTheme = ref('btn-primary')
const estGrand = ref(false)
const couleurTexte = ref('blue')
const tailleTexte = ref(16)
const couleurFond = ref('#f0f0f0')
const lienUrl = ref('https://vuejs.org')
const ouvrirNouvelOnglet = ref(true)
const formulaireInvalide = ref(false)
const enChargement = ref(false)

const monStyle = ref({
  color: 'red',
  backgroundColor: '#fff',
  padding: '10px'
})

const styleBase = ref({ fontFamily: 'Arial' })
const styleTheme = ref({ color: 'blue', fontSize: '18px' })

// Computed pour classes complexes
const classesComposant = computed(() => ({
  'composant': true,
  'composant--actif': estActif.value,
  'composant--erreur': aErreur.value,
  'composant--large': estGrand.value
}))

function getImageUrl(id) {
  return `/api/images/${id}.jpg`
}
</script>
V-ON
<!-- TAG: v-on, events, click, submit, keyboard, mouse, modificateurs -->
vue

<template>
  <!-- Syntaxe complète vs raccourci -->
  <button v-on:click="direBonjour">Cliquer</button>
  <button @click="direBonjour">Cliquer</button>   <!-- Raccourci -->
  
  <!-- ===== ÉVÉNEMENTS SOURIS ===== -->
  <button @click="onClick">Click</button>
  <button @dblclick="onDblClick">Double Click</button>
  <div @mouseover="onHover">Hover</div>
  <div @mouseout="onLeave">Quitter</div>
  <div @mouseenter="onEnter">Entrer</div>
  <div @mousemove="onMove($event)">Bouger</div>
  <div @mousedown="onDown">Appuyer</div>
  <div @mouseup="onUp">Relâcher</div>
  <div @contextmenu.prevent="onRightClick">Clic droit</div>
  
  <!-- ===== ÉVÉNEMENTS CLAVIER ===== -->
  <input @keydown="onKeyDown($event)">
  <input @keyup="onKeyUp($event)">
  <input @keypress="onKeyPress($event)">
  
  <!-- Touches spécifiques -->
  <input @keyup.enter="valider">          <!-- Entrée -->
  <input @keyup.escape="annuler">         <!-- Échap -->
  <input @keyup.tab="suivant">            <!-- Tab -->
  <input @keyup.delete="supprimer">       <!-- Suppr -->
  <input @keyup.space="espace">           <!-- Espace -->
  <input @keyup.up="haut">               <!-- ↑ -->
  <input @keyup.down="bas">              <!-- ↓ -->
  <input @keyup.left="gauche">           <!-- ← -->
  <input @keyup.right="droite">          <!-- → -->
  
  <!-- Combinaisons de touches -->
  <input @keyup.ctrl.enter="ctrlEntree">
  <input @keyup.alt.s="altS">
  <input @keyup.shift.f5="shiftF5">
  <input @keyup.meta.k="cmdK">           <!-- Cmd sur Mac -->
  
  <!-- ===== MODIFICATEURS D'ÉVÉNEMENTS ===== -->
  
  <!-- .prevent : event.preventDefault() -->
  <form @submit.prevent="soumettre">
    <button type="submit">Envoyer</button>
  </form>
  <a href="https://google.com" @click.prevent="onClick">
    Pas de navigation
  </a>
  
  <!-- .stop : event.stopPropagation() -->
  <div @click="clicParent">
    Parent
    <button @click.stop="clicEnfant">
      Enfant (pas de propagation)
    </button>
  </div>
  
  <!-- .once : exécuté une seule fois -->
  <button @click.once="direBonjour">
    Une seule fois
  </button>
  
  <!-- .self : seulement si clic sur l'élément lui-même -->
  <div @click.self="clicDiv" style="padding: 20px">
    <button>Ce bouton ne déclenche pas clicDiv</button>
  </div>
  
  <!-- .capture : phase de capture -->
  <div @click.capture="clicCapture">...</div>
  
  <!-- .passive : améliore les performances (scroll) -->
  <div @scroll.passive="onScroll">...</div>
  
  <!-- Chaîner les modificateurs -->
  <button @click.stop.prevent="action">Action</button>
  
  <!-- ===== MODIFICATEURS DE TOUCHES SPÉCIALES ===== -->
  <!-- .exact : exactement les touches indiquées -->
  <button @click.exact="sansTouches">Sans modificateurs</button>
  <button @click.ctrl.exact="seulementCtrl">Ctrl uniquement</button>
  
  <!-- ===== ÉVÉNEMENTS FORMULAIRE ===== -->
  <input @change="onChange" @input="onInput" @focus="onFocus" @blur="onBlur">
  <select @change="onSelectChange"></select>
  
  <!-- ===== ÉVÉNEMENT AVEC ARGUMENT ===== -->
  <button @click="traiter(item, $event)">Traiter</button>
  
  <!-- ===== GESTIONNAIRE INLINE ===== -->
  <button @click="compteur++">{{ compteur }}</button>
  <button @click="message = 'Bonjour!'">Changer message</button>
</template>

<script setup>
import { ref } from 'vue'

const compteur = ref(0)
const message = ref('')

function direBonjour() { alert('Bonjour!') }
function valider() { console.log('Formulaire validé') }
function soumettre() { console.log('Formulaire soumis') }
function clicParent() { console.log('Clic parent') }
function clicEnfant() { console.log('Clic enfant') }
function clicDiv() { console.log('Clic sur le div lui-même') }
function onScroll() { console.log('Scroll') }
function traiter(item, event) {
  console.log('Item:', item)
  console.log('Event:', event)
}
</script>
DIRECTIVES PERSONNALISÉES
<!-- TAG: custom directive, directive personnalisée, v-focus, v-tooltip -->
vue

<!-- Directive locale dans un composant -->
<script setup>
// Directive locale (utilisable seulement dans ce composant)
const vFocus = {
  mounted(el) {
    el.focus()
  }
}

const vColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
}

const vTooltip = {
  mounted(el, binding) {
    el.title = binding.value
    el.style.cursor = 'help'
  }
}

// Directive avec modificateurs et argument
const vPermission = {
  mounted(el, binding) {
    // v-permission:action.modifier="valeur"
    const { value, arg, modifiers } = binding
    console.log('Valeur:', value)      // "admin"
    console.log('Argument:', arg)     // "edit"
    console.log('Modificateurs:', modifiers) // { required: true }
    
    if (!userHasPermission(value)) {
      el.style.display = 'none'
    }
  }
}

function userHasPermission(role) {
  return ['admin', 'superuser'].includes(role)
}
</script>

<template>
  <!-- Utilisation des directives locales -->
  <input v-focus>
  <p v-color="'red'">Texte rouge</p>
  <button v-tooltip="'Cliquer pour sauvegarder'">Sauvegarder</button>
  <button v-permission:edit.required="'admin'">Modifier</button>
</template>
JavaScript

// Directive globale (main.js)
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// v-focus global
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// Directive complète avec tous les hooks
app.directive('highlight', {
  // Avant que l'élément soit monté dans le DOM
  beforeMount(el, binding, vnode) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
  
  // Quand l'élément est monté
  mounted(el, binding) {
    console.log('Monté avec valeur:', binding.value)
  },
  
  // Avant mise à jour du composant parent
  beforeUpdate(el, binding) {},
  
  // Après mise à jour
  updated(el, binding) {
    el.style.backgroundColor = binding.value
  },
  
  // Avant démontage
  beforeUnmount(el) {},
  
  // Après démontage
  unmounted(el) {}
})

// Raccourci (mounted + updated)
app.directive('couleur', (el, binding) => {
  el.style.color = binding.value
})

app.mount('#app')
vue

<!-- Utilisation des directives globales -->
<template>
  <input v-focus>
  <p v-highlight="'#ffff99'">Texte surligné</p>
  <p v-highlight>Jaune par défaut</p>
  <span v-couleur="'blue'">Texte bleu</span>
</template>
text


---

## 📄 Fichier 3 : `vue-composants.md`

```markdown
# VUE.JS - COMPOSANTS
<!-- TAG: composants, props, emits, slots, expose, provide, inject, teleport, keepalive -->

## TABLE DES MATIÈRES
1. [Structure d'un composant](#structure)
2. [Props](#props)
3. [Emits / Événements](#emits)
4. [Slots](#slots)
5. [Provide / Inject](#provide-inject)
6. [defineExpose](#defineexpose)
7. [Composants dynamiques](#composants-dynamiques)
8. [KeepAlive](#keepalive)
9. [Teleport](#teleport)
10. [Composants asynchrones](#composants-asynchrones)

---

## STRUCTURE D'UN COMPOSANT
<!-- TAG: sfc, single file component, template, script, style -->

```vue
<!-- MonComposant.vue -->
<template>
  <!-- 1. Le template peut avoir plusieurs éléments racines en Vue 3 -->
  <div class="mon-composant">
    <h1>{{ titre }}</h1>
    <p>{{ description }}</p>
    <button @click="incrementer">Compteur: {{ compteur }}</button>
  </div>
</template>

<script setup>
// 2. Script avec la Composition API (recommandé Vue 3)
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  titre: String,
  description: String
})

// Données réactives
const compteur = ref(0)

// Méthodes
function incrementer() {
  compteur.value++
}

// Lifecycle
onMounted(() => {
  console.log('MonComposant monté')
})
</script>

<style scoped>
/* 3. CSS scopé (n'affecte que ce composant) */
.mon-composant {
  padding: 20px;
  border: 1px solid #ccc;
}

h1 {
  color: blue; /* N'affecte QUE les h1 de ce composant */
}
</style>
Style : scoped vs global vs module
vue

<style scoped>
/* Affecte uniquement ce composant */
/* Vue ajoute un attribut unique : data-v-xxxxxx */
.btn { color: red; }
</style>

<style>
/* CSS global - affecte toute l'application */
body { margin: 0; }
</style>

<style module>
/* CSS Modules - classes accessibles via $style.nomClasse */
.titre { font-size: 2rem; }
</style>

<!-- Utilisation des CSS Modules -->
<template>
  <h1 :class="$style.titre">Mon titre</h1>
</template>
Enregistrement et utilisation de composants
vue

<!-- App.vue -->
<script setup>
// Import automatique avec <script setup>
import BoutonPrimaire from './components/BoutonPrimaire.vue'
import CarteProduit from './components/CarteProduit.vue'
import MonModal from './components/MonModal.vue'

// Pas besoin de les déclarer dans components: {}
</script>

<template>
  <!-- PascalCase recommandé -->
  <BoutonPrimaire>Cliquer</BoutonPrimaire>
  <CarteProduit :produit="monProduit" />
  
  <!-- kebab-case aussi valide -->
  <carte-produit :produit="monProduit" />
  
  <!-- Composant auto-fermant si pas de contenu -->
  <MonModal />
</template>
PROPS
<!-- TAG: props, defineProps, propTypes, validation, default, required -->
vue

<!-- EnfantComposant.vue -->
<script setup>
import { computed } from 'vue'

// Syntaxe simple (tableau)
// const props = defineProps(['titre', 'age', 'actif'])

// Syntaxe avec validation (recommandée)
const props = defineProps({
  // Type simple
  titre: String,
  age: Number,
  actif: Boolean,
  tags: Array,
  utilisateur: Object,
  
  // Avec options de validation
  nom: {
    type: String,
    required: true    // Obligatoire
  },
  
  compteur: {
    type: Number,
    default: 0        // Valeur par défaut
  },
  
  couleur: {
    type: String,
    default: 'blue',
    validator(valeur) {
      // Doit retourner true si valide
      return ['red', 'blue', 'green'].includes(valeur)
    }
  },
  
  // Plusieurs types possibles
  taille: {
    type: [String, Number],
    default: '16px'
  },
  
  // Objet avec valeur par défaut (utiliser une fonction)
  config: {
    type: Object,
    default: () => ({
      theme: 'light',
      langue: 'fr'
    })
  },
  
  // Tableau avec valeur par défaut
  items: {
    type: Array,
    default: () => []
  },
  
  // Fonction
  onClick: {
    type: Function,
    default: null
  }
})

// Accéder aux props
console.log(props.nom)
console.log(props.compteur)

// ❌ Ne JAMAIS modifier les props directement
// props.nom = 'Nouveau' // Erreur!

// ✅ Si besoin de modifier, créer une donnée locale
const nomLocal = ref(props.nom)

// ✅ Ou utiliser computed pour dériver une valeur
const nomEnMajuscule = computed(() => props.nom.toUpperCase())
</script>

<template>
  <div>
    <h2>{{ titre }}</h2>
    <p>Nom: {{ nom }}</p>
    <p>Compteur: {{ compteur }}</p>
    <p :style="{ color: couleur }">Texte coloré</p>
  </div>
</template>
Passage de props depuis le parent
vue

<!-- ParentComposant.vue -->
<script setup>
import { ref } from 'vue'
import EnfantComposant from './EnfantComposant.vue'

const monNom = ref('Alice')
const monAge = ref(28)
const estActif = ref(true)
const monObjet = ref({ id: 1, valeur: 'test' })
</script>

<template>
  <!-- Valeur statique (string) -->
  <EnfantComposant titre="Bonjour" />
  
  <!-- Valeur dynamique -->
  <EnfantComposant :titre="monNom" />
  
  <!-- Nombre -->
  <EnfantComposant :age="monAge" />
  <EnfantComposant :age="28" />        <!-- Nombres nécessitent : -->
  <EnfantComposant age="28" />         <!-- ❌ Ceci passe une STRING "28" -->
  
  <!-- Boolean -->
  <EnfantComposant :actif="estActif" />
  <EnfantComposant actif />             <!-- ✅ Équivalent à :actif="true" -->
  
  <!-- Objet -->
  <EnfantComposant :utilisateur="monObjet" />
  
  <!-- Spread d'objet (toutes les propriétés comme props) -->
  <EnfantComposant v-bind="monObjet" />
  <!-- Équivalent à : -->
  <EnfantComposant :id="monObjet.id" :valeur="monObjet.valeur" />
</template>
Héritage d'attributs (Fallthrough)
vue

<!-- BoutonBase.vue -->
<script setup>
// Désactiver l'héritage automatique des attributs
defineOptions({
  inheritAttrs: false
})

// Accéder aux attributs non-props
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>

<template>
  <!-- $attrs contient les attributs passés mais non déclarés en props -->
  <div class="btn-wrapper">
    <button v-bind="$attrs" class="btn">
      <slot></slot>
    </button>
  </div>
</template>

<!-- Utilisation -->
<!-- <BoutonBase class="extra" id="mon-btn" @click="action">OK</BoutonBase> -->
<!-- class="extra", id, et @click iront sur le <button>, pas sur le <div> -->
EMITS / ÉVÉNEMENTS
<!-- TAG: emits, defineEmits, emit, custom events, événements personnalisés -->
vue

<!-- EnfantComposant.vue -->
<script setup>
// Déclaration des événements émis
const emit = defineEmits(['changer', 'supprimer', 'soumettre'])

// Avec validation (recommandé)
const emit = defineEmits({
  // Pas de validation
  changer: null,
  
  // Avec validation : doit retourner true/false
  soumettre: (payload) => {
    if (!payload.email) {
      console.warn('Email requis dans soumettre')
      return false
    }
    return true
  },
  
  // Événement avec un paramètre numérique
  'update:modelValue': (valeur) => typeof valeur === 'number'
})

// Émettre des événements
function handleClick() {
  emit('changer', { id: 1, valeur: 'nouvelle valeur' })
}

function handleSupprimer(id) {
  emit('supprimer', id)
}

function handleSoumettre() {
  const donnees = { email: 'test@example.com', nom: 'Alice' }
  emit('soumettre', donnees)
}

// Pour v-model personnalisé
const props = defineProps(['modelValue'])
function updateValeur(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <button @click="handleClick">Changer</button>
  <button @click="handleSupprimer(42)">Supprimer</button>
  <button @click="handleSoumettre">Soumettre</button>
  
  <!-- Pour v-model personnalisé -->
  <input :value="modelValue" @input="updateValeur">
</template>
Écouter les événements dans le parent
vue

<!-- ParentComposant.vue -->
<script setup>
import EnfantComposant from './EnfantComposant.vue'
import { ref } from 'vue'

const valeur = ref('')
const message = ref('')

function onChanger(payload) {
  console.log('Reçu:', payload)
  message.value = `Changé: ${payload.valeur}`
}

function onSupprimer(id) {
  console.log('Supprimer id:', id)
}

function onSoumettre(donnees) {
  console.log('Données:', donnees)
}
</script>

<template>
  <!-- Écouter les événements avec @ -->
  <EnfantComposant
    @changer="onChanger"
    @supprimer="onSupprimer"
    @soumettre="onSoumettre"
  />
  
  <!-- v-model avec composant (utilise modelValue + update:modelValue) -->
  <EnfantComposant v-model="valeur" />
  <!-- Équivalent à : -->
  <EnfantComposant 
    :modelValue="valeur" 
    @update:modelValue="valeur = $event"
  />
  
  <!-- v-model avec argument personnalisé -->
  <EnfantComposant v-model:titre="monTitre" />
  <!-- Utilise :titre + @update:titre -->
</template>
SLOTS
<!-- TAG: slots, slot, named slots, scoped slots, contenu, projection -->
vue

<!-- CarteComposant.vue -->
<template>
  <div class="carte">
    <!-- Slot par défaut -->
    <div class="carte-corps">
      <slot>
        <!-- Contenu par défaut si aucun slot fourni -->
        <p>Aucun contenu</p>
      </slot>
    </div>
    
    <!-- Slot nommé -->
    <div class="carte-entete">
      <slot name="entete">
        <h2>Titre par défaut</h2>
      </slot>
    </div>
    
    <div class="carte-pied">
      <slot name="pied">
        <button>OK</button>
      </slot>
    </div>
    
    <!-- Scoped slot (transmet des données vers le parent) -->
    <ul>
      <li v-for="item in items" :key="item.id">
        <slot name="item" :item="item" :index="index">
          <!-- Fallback : affichage par défaut -->
          {{ item.nom }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<script setup>
const items = [
  { id: 1, nom: 'Alice', actif: true },
  { id: 2, nom: 'Bob', actif: false }
]
</script>
vue

<!-- Utilisation dans le parent -->
<template>
  <CarteComposant>
    <!-- Contenu du slot par défaut -->
    <p>Mon contenu personnalisé</p>
    
    <!-- Slots nommés avec v-slot: ou # -->
    <template v-slot:entete>
      <h1>Mon Titre Personnalisé</h1>
    </template>
    
    <!-- Raccourci # pour v-slot: -->
    <template #pied>
      <button @click="sauvegarder">Sauvegarder</button>
      <button @click="annuler">Annuler</button>
    </template>
    
    <!-- Scoped slot : accéder aux données du composant enfant -->
    <template #item="{ item, index }">
      <span :class="{ active: item.actif }">
        {{ index + 1 }}. {{ item.nom }}
        <span v-if="item.actif">✅</span>
      </span>
    </template>
  </CarteComposant>
</template>
Slot dynamique
vue

<template>
  <!-- Nom de slot dynamique -->
  <CarteComposant>
    <template v-slot:[nomSlotDynamique]>
      Contenu dynamique
    </template>
    
    <!-- Raccourci -->
    <template #[nomSlotDynamique]>
      Contenu dynamique
    </template>
  </CarteComposant>
</template>

<script setup>
import { ref } from 'vue'
const nomSlotDynamique = ref('entete')
</script>
PROVIDE / INJECT
<!-- TAG: provide, inject, context, global state, parent enfant profond -->
vue

<!-- Composant ancêtre (App.vue ou composant parent) -->
<script setup>
import { provide, ref, readonly } from 'vue'

const theme = ref('light')
const utilisateur = ref({ nom: 'Alice', role: 'admin' })

// Provide simple
provide('theme', theme)

// Provide en readonly (empêche modification par les enfants)
provide('utilisateur', readonly(utilisateur))

// Provide une fonction pour modifier (pattern recommandé)
function changerTheme(nouveauTheme) {
  theme.value = nouveauTheme
}
provide('changerTheme', changerTheme)

// Provide un objet complet
provide('auth', {
  utilisateur: readonly(utilisateur),
  changerTheme,
  deconnecter: () => { utilisateur.value = null }
})
</script>
vue

<!-- Composant descendant profond -->
<script setup>
import { inject } from 'vue'

// Inject avec valeur par défaut
const theme = inject('theme', 'light')

// Inject sans valeur par défaut (undefined si non fourni)
const utilisateur = inject('utilisateur')

// Inject une fonction
const changerTheme = inject('changerTheme')

// Inject un objet complet
const auth = inject('auth')

// Utilisation
function toggleTheme() {
  changerTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <div :class="'theme-' + theme">
    <p>Utilisateur: {{ utilisateur?.nom }}</p>
    <button @click="toggleTheme">Toggle Theme</button>
  </div>
</template>
DEFINEEXPOSE
<!-- TAG: defineExpose, expose, template ref, ref composant -->
vue

<!-- ComposantEnfant.vue -->
<script setup>
import { ref } from 'vue'

const compteur = ref(0)
const message = ref('Bonjour')

function reinitialiser() {
  compteur.value = 0
  message.value = 'Bonjour'
}

function incrementer() {
  compteur.value++
}

// Exposer des propriétés/méthodes au composant parent
// Par défaut avec <script setup>, RIEN n'est exposé
defineExpose({
  compteur,      // Propriété réactive
  reinitialiser, // Méthode
  incrementer
})
</script>
vue

<!-- ComposantParent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ComposantEnfant from './ComposantEnfant.vue'

// Référence au composant enfant
const enfantRef = ref(null)

onMounted(() => {
  // Accéder aux propriétés exposées
  console.log('Compteur:', enfantRef.value.compteur)
  
  // Appeler des méthodes exposées
  enfantRef.value.incrementer()
  enfantRef.value.reinitialiser()
})

function reinitialiserEnfant() {
  enfantRef.value.reinitialiser()
}
</script>

<template>
  <!-- ref="enfantRef" pour accéder au composant -->
  <ComposantEnfant ref="enfantRef" />
  <button @click="reinitialiserEnfant">Réinitialiser</button>
</template>
COMPOSANTS DYNAMIQUES
<!-- TAG: component, dynamic component, is, composant dynamique -->
vue

<script setup>
import { ref, shallowRef } from 'vue'
import AccueilVue from './views/Accueil.vue'
import AProposVue from './views/APropos.vue'
import ContactVue from './views/Contact.vue'

// Utiliser shallowRef pour les composants (optimisation)
const composantActuel = shallowRef(AccueilVue)

const onglets = [
  { nom: 'Accueil', composant: AccueilVue },
  { nom: 'À Propos', composant: AProposVue },
  { nom: 'Contact', composant: ContactVue }
]

function changerOnglet(composant) {
  composantActuel.value = composant
}
</script>

<template>
  <!-- Onglets -->
  <div class="tabs">
    <button
      v-for="onglet in onglets"
      :key="onglet.nom"
      @click="changerOnglet(onglet.composant)"
      :class="{ active: composantActuel === onglet.composant }"
    >
      {{ onglet.nom }}
    </button>
  </div>
  
  <!-- Composant dynamique avec :is -->
  <component :is="composantActuel" />
  
  <!-- Avec KeepAlive pour préserver l'état -->
  <KeepAlive>
    <component :is="composantActuel" />
  </KeepAlive>
</template>
KEEPALIVE
<!-- TAG: keepalive, cache, état préservé, tabs -->
vue

<template>
  <!-- Préserver l'état des composants -->
  <KeepAlive>
    <component :is="composantActuel" />
  </KeepAlive>
  
  <!-- Include : seulement certains composants -->
  <KeepAlive include="AccueilVue,AProposVue">
    <component :is="composantActuel" />
  </KeepAlive>
  
  <!-- Exclude : tous sauf certains -->
  <KeepAlive exclude="ContactVue">
    <component :is="composantActuel" />
  </KeepAlive>
  
  <!-- Max : nombre max de composants en cache -->
  <KeepAlive :max="5">
    <component :is="composantActuel" />
  </KeepAlive>
</template>
TELEPORT
<!-- TAG: teleport, portal, modal, to, body -->
vue

<!-- MonModal.vue -->
<script setup>
const props = defineProps({
  estOuvert: Boolean
})
const emit = defineEmits(['fermer'])
</script>

<template>
  <!-- Teleport rend le contenu dans un autre élément du DOM -->
  <!-- Utile pour les modales, tooltips, notifications -->
  <Teleport to="body">
    <div v-if="estOuvert" class="modal-overlay" @click="emit('fermer')">
      <div class="modal" @click.stop>
        <button @click="emit('fermer')">×</button>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Ces styles doivent être globaux car le composant est dans <body> */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}
</style>
vue

<!-- Utilisation -->
<script setup>
import { ref } from 'vue'
import MonModal from './MonModal.vue'

const modalOuverte = ref(false)
</script>

<template>
  <button @click="modalOuverte = true">Ouvrir Modal</button>
  
  <MonModal 
    :est-ouvert="modalOuverte" 
    @fermer="modalOuverte = false"
  >
    <h2>Titre de la Modal</h2>
    <p>Contenu de la modal</p>
  </MonModal>
  
  <!-- Teleport vers une div spécifique -->
  <Teleport to="#notifications">
    <div class="notification">Message!</div>
  </Teleport>
  
  <!-- Désactiver le teleport conditionnellement -->
  <Teleport to="body" :disabled="!surMobile">
    <div>Contenu</div>
  </Teleport>
</template>
COMPOSANTS ASYNCHRONES
<!-- TAG: defineAsyncComponent, lazy loading, suspense, chargement lazy -->
JavaScript

// Chargement paresseux d'un composant
import { defineAsyncComponent } from 'vue'

// Simple
const MonComposantAsync = defineAsyncComponent(() =>
  import('./composants/MonComposant.vue')
)

// Avec options
const MonComposantAsync = defineAsyncComponent({
  // Fonction de chargement
  loader: () => import('./composants/MonComposant.vue'),
  
  // Composant affiché pendant le chargement
  loadingComponent: ComposantChargement,
  delay: 200,  // Délai avant d'afficher le loadingComponent (ms)
  
  // Composant affiché en cas d'erreur
  errorComponent: ComposantErreur,
  timeout: 3000 // Timeout en ms
})
vue

<!-- Avec Suspense -->
<template>
  <Suspense>
    <!-- Composant principal -->
    <template #default>
      <MonComposantAsync />
    </template>
    
    <!-- Fallback pendant le chargement -->
    <template #fallback>
      <div>Chargement en cours...</div>
    </template>
  </Suspense>
</template>
text


---

## 📄 Fichier 4 : `vue-reactivite.md`

```markdown
# VUE.JS - RÉACTIVITÉ
<!-- TAG: réactivité, ref, reactive, computed, readonly, toRef, toRefs, shallowRef, shallowReactive, markRaw -->

## TABLE DES MATIÈRES
1. [ref()](#ref)
2. [reactive()](#reactive)
3. [computed()](#computed)
4. [readonly()](#readonly)
5. [toRef() et toRefs()](#toref-torefs)
6. [shallowRef et shallowReactive](#shallow)
7. [markRaw()](#markraw)
8. [isRef, isReactive, isReadonly](#is-helpers)
9. [unref()](#unref)
10. [Template Refs (accès DOM)](#template-refs)

---

## REF()
<!-- TAG: ref, référence réactive, .value, primitif -->

```javascript
import { ref } from 'vue'

// Créer une référence réactive pour les primitifs
const compteur = ref(0)
const message = ref('Bonjour')
const estActif = ref(false)
const prix = ref(9.99)

// Accéder/modifier la valeur avec .value (en JS)
console.log(compteur.value)     // 0
compteur.value++                 // Incrémentation
compteur.value = 42              // Assignation directe
message.value = 'Au revoir'

// Dans le template : PAS de .value nécessaire
// <p>{{ compteur }}</p>    ← Vue dés-encapsule automatiquement

// ref peut aussi contenir des objets
const utilisateur = ref({
  nom: 'Alice',
  age: 28,
  adresse: {
    ville: 'Paris',
    codePostal: '75001'
  }
})

// Accès aux propriétés
console.log(utilisateur.value.nom)        // 'Alice'
utilisateur.value.nom = 'Bob'             // Réactif ✅
utilisateur.value.age++                    // Réactif ✅

// Remplacer l'objet entier
utilisateur.value = { nom: 'Charlie', age: 35 }  // Réactif ✅

// Tableau réactif
const fruits = ref(['pomme', 'banane', 'orange'])
fruits.value.push('fraise')               // Réactif ✅
fruits.value.splice(1, 1)                 // Réactif ✅
fruits.value = ['kiwi', 'mangue']        // Réactif ✅
Déstructuration des refs (piège courant)
JavaScript

import { ref } from 'vue'

const etat = ref({ compteur: 0, nom: 'Alice' })

// ❌ PROBLÈME : perte de la réactivité
const { compteur, nom } = etat.value
compteur++ // NE met PAS à jour la vue!

// ✅ SOLUTION 1 : accéder directement
etat.value.compteur++

// ✅ SOLUTION 2 : utiliser toRefs()
import { toRefs } from 'vue'
const { compteur, nom } = toRefs(etat.value)
compteur.value++ // Réactif ✅
REACTIVE()
<!-- TAG: reactive, objet réactif, proxy, deep reactive -->
JavaScript

import { reactive } from 'vue'

// reactive() pour les objets et tableaux
const etat = reactive({
  compteur: 0,
  nom: 'Alice',
  liste: [1, 2, 3],
  config: {
    theme: 'light',
    langue: 'fr'
  }
})

// Accès et modification SANS .value
etat.compteur++                  // Réactif ✅
etat.nom = 'Bob'                 // Réactif ✅
etat.liste.push(4)               // Réactif ✅
etat.config.theme = 'dark'       // Réactif ✅ (profond par défaut)

// Ajouter de nouvelles propriétés (Vue 3 uniquement)
etat.nouvelleProprieté = 'valeur' // Réactif ✅ en Vue 3

// Supprimer une propriété
delete etat.compteur              // Réactif ✅ en Vue 3

// ❌ PAS de remplacement de l'objet entier
// etat = { nouveau: 'objet' }  // Perd la réactivité!

// ✅ SOLUTION : Object.assign pour "remplacer"
Object.assign(etat, { compteur: 0, nom: 'Reset' })

// Tableau réactif avec reactive
const liste = reactive([1, 2, 3])
liste.push(4)        // Réactif ✅
liste[0] = 10        // Réactif ✅ (Vue 3 seulement)
liste.splice(1, 1)   // Réactif ✅
ref() vs reactive() : guide de choix
text

ref()
  ✅ Primitifs (string, number, boolean)
  ✅ Quand on veut remplacer la valeur entière
  ✅ Props transmises entre fonctions
  ✅ À préférer en général (plus prévisible)
  ❌ Nécessite .value en JS

reactive()
  ✅ Objets complexes avec structure fixe
  ✅ Store local avec plusieurs propriétés liées
  ✅ Pas de .value nécessaire
  ❌ Perte de réactivité si destructuré/remplacé
  ❌ Ne marche pas avec les primitifs
READONLY()
<!-- TAG: readonly, immuable, protection, read-only -->
JavaScript

import { ref, reactive, readonly } from 'vue'

const original = reactive({ compteur: 0 })
const protege = readonly(original)

// ❌ Erreur en développement
protege.compteur++ // Warning: Set operation failed: target is readonly

// ✅ Modifier l'original (les changements se reflètent sur readonly)
original.compteur++ 
console.log(protege.compteur) // 1

// Avec ref
const monRef = ref(0)
const refProtegee = readonly(monRef)
// refProtegee.value++ // ❌ Warning

// Cas d'usage : provide/inject
// Fournir en readonly pour que les enfants ne puissent pas modifier
provide('etat', readonly(etat))
TOREF ET TOREFS
<!-- TAG: toRef, toRefs, déstructuration réactive, composables -->
JavaScript

import { reactive, ref, toRef, toRefs } from 'vue'

const etat = reactive({
  nom: 'Alice',
  age: 28,
  ville: 'Paris'
})

// toRef() : créer une ref vers une propriété spécifique
const nomRef = toRef(etat, 'nom')
console.log(nomRef.value) // 'Alice'
nomRef.value = 'Bob'       // Modifie etat.nom ✅ (lié!)

// toRefs() : convertir tout un reactive en refs
const { nom, age, ville } = toRefs(etat)
// Maintenant ce sont des refs, gardent la liaison avec etat
nom.value = 'Charlie'  // Modifie etat.nom ✅

// Utilisation principale : dans les composables
function useUtilisateur() {
  const utilisateur = reactive({
    nom: '',
    email: '',
    connecte: false
  })
  
  function connecter(data) {
    Object.assign(utilisateur, data)
    utilisateur.connecte = true
  }
  
  // Retourner toRefs pour permettre la déstructuration
  return {
    ...toRefs(utilisateur),
    connecter
  }
}

// Dans le composant
const { nom, email, connecte, connecter } = useUtilisateur()
// nom, email, connecte sont des refs réactives ✅
SHALLOW - SHALLOWREF ET SHALLOWREACTIVE
<!-- TAG: shallowRef, shallowReactive, performance, optimisation, surface -->
JavaScript

import { shallowRef, shallowReactive, triggerRef } from 'vue'

// shallowRef : réactivité SEULEMENT pour .value (pas en profondeur)
const etat = shallowRef({
  compteur: 0,
  utilisateur: { nom: 'Alice' }
})

etat.value = { compteur: 1 }    // ✅ Réactif (remplace .value)
etat.value.compteur++            // ❌ PAS réactif (propriété interne)
etat.value.utilisateur.nom = 'Bob' // ❌ PAS réactif

// Forcer une mise à jour
triggerRef(etat) // Force la mise à jour du DOM

// shallowReactive : réactivité SEULEMENT au premier niveau
const config = shallowReactive({
  theme: 'light',        // ✅ Réactif
  options: {
    couleur: 'blue'     // ❌ PAS réactif (niveau 2)
  }
})

config.theme = 'dark'         // ✅ Réactif
config.options.couleur = 'red' // ❌ PAS réactif

// Cas d'usage : 
// - Grandes structures de données non réactives
// - Composants qui changent en entier (shallowRef)
// - Optimisation des performances
const composantActuel = shallowRef(MonComposant)
MARKRAW
<!-- TAG: markRaw, non réactif, performance, bibliothèque tierce -->
JavaScript

import { reactive, markRaw, ref } from 'vue'

// markRaw : empêche Vue de rendre l'objet réactif
// Utile pour : instances de bibliothèques tierces, classes complexes

class MaBibliotheque {
  constructor() {
    this.data = 'valeur'
  }
  methode() { return this.data }
}

const instance = markRaw(new MaBibliotheque())

const etat = reactive({
  compteur: 0,
  // Intégrer un objet non-réactif dans un reactive
  bibliotheque: markRaw(new MaBibliotheque()),
  carte: markRaw(new MapInstance())  // Ex: Leaflet, Google Maps
})

// La bibliothèque ne sera PAS transformée en Proxy
etat.bibliotheque.methode() // Fonctionne normalement, sans overhead de réactivité
IS HELPERS
<!-- TAG: isRef, isReactive, isReadonly, isProxy -->
JavaScript

import { ref, reactive, readonly, isRef, isReactive, isReadonly, isProxy } from 'vue'

const monRef = ref(0)
const monReactive = reactive({})
const monReadonly = readonly(monReactive)

// Vérifications
console.log(isRef(monRef))          // true
console.log(isRef(monReactive))     // false
console.log(isRef(0))               // false

console.log(isReactive(monReactive))  // true
console.log(isReactive(monRef))       // false
console.log(isReactive(monReadonly))  // true (c'est un proxy réactif)

console.log(isReadonly(monReadonly))  // true
console.log(isReadonly(monReactive))  // false

console.log(isProxy(monReactive))   // true
console.log(isProxy(monReadonly))   // true
console.log(isProxy(monRef))        // false (ref n'est pas un Proxy)

// Utile dans les composables
function traiterValeur(valeur) {
  if (isRef(valeur)) {
    return valeur.value
  }
  return valeur
}
UNREF
<!-- TAG: unref, déréférencer, ref ou valeur -->
JavaScript

import { ref, unref } from 'vue'

const monRef = ref(42)
const simple = 42

// unref : retourne .value si c'est une ref, sinon retourne la valeur
console.log(unref(monRef))  // 42
console.log(unref(simple))  // 42

// Équivalent à :
// isRef(val) ? val.value : val

// Très utile dans les composables pour accepter ref ou valeur
function doubler(valeur) {
  return unref(valeur) * 2
}

doubler(ref(5))  // 10
doubler(5)       // 10
TEMPLATE REFS (ACCÈS DOM)
<!-- TAG: template ref, useTemplateRef, accès DOM, ref DOM, getElementById -->
vue

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'

// Méthode 1 : ref simple (Vue 3.3-)
const inputRef = ref(null)
const divRef = ref(null)

// Méthode 2 : useTemplateRef (Vue 3.5+, recommandée)
const inputElement = useTemplateRef('monInput')

onMounted(() => {
  // L'élément DOM est disponible après le montage
  inputRef.value.focus()
  inputRef.value.value = 'Valeur initiale'
  
  console.log(divRef.value)           // <div>...</div>
  console.log(divRef.value.offsetWidth) // Largeur en pixels
  
  // Manipulation directe du DOM
  divRef.value.style.backgroundColor = 'red'
  divRef.value.classList.add('active')
  
  // Avec useTemplateRef
  inputElement.value?.focus()
})

// Refs dans les boucles
const items = ref([
  { id: 1, texte: 'Un' },
  { id: 2, texte: 'Deux' }
])
const itemRefs = ref([])  // Tableau de refs DOM

onMounted(() => {
  console.log(itemRefs.value)  // [<li>, <li>]
})
</script>

<template>
  <!-- Méthode 1 : ref="nomDeLaRef" -->
  <input ref="inputRef" type="text">
  <div ref="divRef">Mon div</div>
  
  <!-- Méthode 2 : useTemplateRef -->
  <input ref="monInput" type="text">
  
  <!-- Refs dans v-for -->
  <ul>
    <li 
      v-for="item in items" 
      :key="item.id"
      ref="itemRefs"
    >
      {{ item.texte }}
    </li>
  </ul>
  
  <!-- Ref avec callback function -->
  <div :ref="(el) => { if (el) console.log('Monté:', el) }">
    Callback ref
  </div>
</template>
text


---

## 📄 Fichier 5 : `vue-composables.md`

```markdown
# VUE.JS - COMPOSABLES
<!-- TAG: composables, use, logique réutilisable, hooks, composition, useFetch, useLocalStorage, useEventListener -->

## TABLE DES MATIÈRES
1. [Qu'est-ce qu'un composable](#introduction)
2. [Structure d'un composable](#structure)
3. [Composables courants](#composables-courants)
4. [Composables avec lifecycle](#lifecycle-composables)
5. [VueUse (bibliothèque)](#vueuse)

---

## INTRODUCTION
<!-- TAG: composable, use, logique réutilisable, DRY -->

Un **composable** est une fonction qui utilise la Composition API de Vue pour
encapsuler et réutiliser de la logique avec état.

Règles de nommage :
- Préfixe `use` obligatoire : `useCompteur`, `useFetch`, `useAuth`
- Fichier dans `src/composables/`
src/composables/
├── useCompteur.js
├── useFetch.js
├── useLocalStorage.js
├── useAuth.js
├── useFormValidation.js
└── useEventListener.js

text


---

## STRUCTURE D'UN COMPOSABLE
<!-- TAG: structure, useCompteur, exemple basique -->

```javascript
// src/composables/useCompteur.js
import { ref, computed } from 'vue'

export function useCompteur(valeurInitiale = 0) {
  // État réactif privé (ou public si retourné)
  const compteur = ref(valeurInitiale)
  const historique = ref([valeurInitiale])
  
  // Computed
  const estNegatif = computed(() => compteur.value < 0)
  const estPositif = computed(() => compteur.value > 0)
  const double = computed(() => compteur.value * 2)
  
  // Méthodes
  function incrementer(montant = 1) {
    compteur.value += montant
    historique.value.push(compteur.value)
  }
  
  function decrementer(montant = 1) {
    compteur.value -= montant
    historique.value.push(compteur.value)
  }
  
  function reinitialiser() {
    compteur.value = valeurInitiale
    historique.value = [valeurInitiale]
  }
  
  // Retourner les éléments à exposer
  return {
    compteur,        // ref réactive
    historique,      // ref réactive
    estNegatif,      // computed
    estPositif,      // computed
    double,          // computed
    incrementer,     // méthode
    decrementer,     // méthode
    reinitialiser    // méthode
  }
}
vue

<!-- Utilisation dans un composant -->
<script setup>
import { useCompteur } from '@/composables/useCompteur'

// Chaque utilisation crée sa propre instance isolée
const { compteur, incrementer, decrementer, reinitialiser, double } = useCompteur(10)
const autreCompteur = useCompteur(100)  // Instance séparée
</script>

<template>
  <div>
    <p>Compteur: {{ compteur }}</p>
    <p>Double: {{ double }}</p>
    <button @click="incrementer">+1</button>
    <button @click="incrementer(5)">+5</button>
    <button @click="decrementer">-1</button>
    <button @click="reinitialiser">Reset</button>
  </div>
</template>
COMPOSABLES COURANTS
useFetch - Requêtes HTTP
<!-- TAG: useFetch, fetch, http, api, loading, error, data -->
JavaScript

// src/composables/useFetch.js
import { ref, watch, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const erreur = ref(null)
  const enChargement = ref(false)

  async function charger() {
    // Réinitialiser l'état
    data.value = null
    erreur.value = null
    enChargement.value = true
    
    try {
      // toValue() gère ref, computed ou valeur simple
      const urlResolue = toValue(url)
      
      const response = await fetch(urlResolue)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      data.value = await response.json()
    } catch (err) {
      erreur.value = err.message
      console.error('Erreur fetch:', err)
    } finally {
      enChargement.value = false
    }
  }

  // Recharger si l'URL change (reactive URL)
  watch(() => toValue(url), charger, { immediate: true })

  return { data, erreur, enChargement, charger }
}

// ===== VERSION AVANCÉE =====
export function useFetchAvance(url, options = {}) {
  const data = ref(null)
  const erreur = ref(null)
  const enChargement = ref(false)
  const status = ref(null)
  
  const {
    immediate = true,
    methode = 'GET',
    headers = {},
    transformResponse = (d) => d
  } = options

  const controller = new AbortController()
  
  async function executer(body = null) {
    enChargement.value = true
    erreur.value = null
    
    try {
      const fetchOptions = {
        method: methode,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      }
      
      if (body) {
        fetchOptions.body = JSON.stringify(body)
      }
      
      const response = await fetch(toValue(url), fetchOptions)
      status.value = response.status
      
      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      
      const json = await response.json()
      data.value = transformResponse(json)
    } catch (err) {
      if (err.name !== 'AbortError') {
        erreur.value = err.message
      }
    } finally {
      enChargement.value = false
    }
  }
  
  // Annuler la requête
  function annuler() {
    controller.abort()
  }
  
  if (immediate) {
    executer()
  }
  
  // Nettoyage automatique
  onUnmounted(() => annuler())
  
  return { data, erreur, enChargement, status, executer, annuler }
}
vue

<!-- Utilisation de useFetch -->
<script setup>
import { ref } from 'vue'
import { useFetch } from '@/composables/useFetch'

// URL statique
const { data: utilisateurs, enChargement, erreur } = useFetch(
  'https://jsonplaceholder.typicode.com/users'
)

// URL réactive (rechargement automatique)
const userId = ref(1)
const { data: utilisateur } = useFetch(
  computed(() => `https://jsonplaceholder.typicode.com/users/${userId.value}`)
)

// Changer l'ID recharge automatiquement
function chargerUtilisateur(id) {
  userId.value = id
}
</script>

<template>
  <div v-if="enChargement">⏳ Chargement...</div>
  <div v-else-if="erreur">❌ Erreur: {{ erreur }}</div>
  <ul v-else>
    <li v-for="user in utilisateurs" :key="user.id">
      {{ user.name }} - {{ user.email }}
    </li>
  </ul>
</template>
useLocalStorage - Persistance
<!-- TAG: localStorage, useLocalStorage, persistance, stockage -->
JavaScript

// src/composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(cle, valeurParDefaut = null) {
  // Lire la valeur initiale
  function lireStockage() {
    try {
      const valeur = localStorage.getItem(cle)
      return valeur ? JSON.parse(valeur) : valeurParDefaut
    } catch (err) {
      console.error('Erreur lecture localStorage:', err)
      return valeurParDefaut
    }
  }
  
  const valeur = ref(lireStockage())
  
  // Synchroniser avec localStorage à chaque changement
  watch(
    valeur,
    (nouvelleValeur) => {
      try {
        if (nouvelleValeur === null || nouvelleValeur === undefined) {
          localStorage.removeItem(cle)
        } else {
          localStorage.setItem(cle, JSON.stringify(nouvelleValeur))
        }
      } catch (err) {
        console.error('Erreur écriture localStorage:', err)
      }
    },
    { deep: true }  // Observer les changements profonds
  )
  
  function supprimer() {
    localStorage.removeItem(cle)
    valeur.value = valeurParDefaut
  }
  
  return [valeur, supprimer]
}
vue

<script setup>
import { useLocalStorage } from '@/composables/useLocalStorage'

const [theme, supprimerTheme] = useLocalStorage('theme', 'light')
const [panier, supprimerPanier] = useLocalStorage('panier', [])
const [utilisateur] = useLocalStorage('utilisateur', null)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  // Automatiquement sauvegardé dans localStorage!
}

function ajouterAuPanier(produit) {
  panier.value.push(produit)
  // Automatiquement sauvegardé!
}
</script>
useEventListener - Gestionnaire d'événements
<!-- TAG: useEventListener, addEventListener, removeEventListener, cleanup -->
JavaScript

// src/composables/useEventListener.js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(cible, evenement, handler, options) {
  onMounted(() => {
    cible.addEventListener(evenement, handler, options)
  })
  
  onUnmounted(() => {
    cible.removeEventListener(evenement, handler, options)
  })
}
JavaScript

// src/composables/useSouris.js
import { ref } from 'vue'
import { useEventListener } from './useEventListener'

export function useSouris() {
  const x = ref(0)
  const y = ref(0)
  const estClique = ref(false)

  useEventListener(window, 'mousemove', (event) => {
    x.value = event.clientX
    y.value = event.clientY
  })
  
  useEventListener(window, 'mousedown', () => {
    estClique.value = true
  })
  
  useEventListener(window, 'mouseup', () => {
    estClique.value = false
  })

  return { x, y, estClique }
}
JavaScript

// src/composables/useClavier.js
import { ref } from 'vue'
import { useEventListener } from './useEventListener'

export function useClavier() {
  const touchesAppuyees = ref(new Set())
  
  useEventListener(window, 'keydown', (e) => {
    touchesAppuyees.value.add(e.key)
  })
  
  useEventListener(window, 'keyup', (e) => {
    touchesAppuyees.value.delete(e.key)
  })
  
  function estAppuyee(touche) {
    return touchesAppuyees.value.has(touche)
  }
  
  return { touchesAppuyees, estAppuyee }
}
useFormValidation - Validation de formulaire
<!-- TAG: useFormValidation, validation, formulaire, form, règles -->
JavaScript

// src/composables/useFormValidation.js
import { ref, computed } from 'vue'

export function useFormValidation(champInitiaux, regles) {
  // Créer les refs pour chaque champ
  const champs = ref(Object.fromEntries(
    Object.keys(champInitiaux).map(cle => [cle, champInitiaux[cle]])
  ))
  
  const erreurs = ref({})
  const touchés = ref({})
  
  // Règles de validation communes
  const validateurs = {
    requis: (valeur) => valeur !== '' && valeur !== null && valeur !== undefined,
    email: (valeur) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur),
    minLength: (min) => (valeur) => valeur.length >= min,
    maxLength: (max) => (valeur) => valeur.length <= max,
    motDePasse: (valeur) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(valeur),
    telephone: (valeur) => /^(\+33|0)[0-9]{9}$/.test(valeur.replace(/\s/g, '')),
    url: (valeur) => {
      try { new URL(valeur); return true }
      catch { return false }
    }
  }
  
  function validerChamp(nomChamp) {
    const reglesDuChamp = regles[nomChamp]
    if (!reglesDuChamp) return true
    
    const valeur = champs.value[nomChamp]
    const erreursChamp = []
    
    for (const regle of reglesDuChamp) {
      const valide = regle.validateur(valeur)
      if (!valide) {
        erreursChamp.push(regle.message)
      }
    }
    
    erreurs.value[nomChamp] = erreursChamp
    return erreursChamp.length === 0
  }
  
  function validerTout() {
    let formulaireValide = true
    for (const champ in regles) {
      touchés.value[champ] = true
      if (!validerChamp(champ)) {
        formulaireValide = false
      }
    }
    return formulaireValide
  }
  
  function marquerTouché(nomChamp) {
    touchés.value[nomChamp] = true
    validerChamp(nomChamp)
  }
  
  const estValide = computed(() => {
    return Object.values(erreurs.value).every(e => e.length === 0)
  })
  
  function reinitialiser() {
    champs.value = { ...champInitiaux }
    erreurs.value = {}
    touchés.value = {}
  }
  
  return {
    champs,
    erreurs,
    touchés,
    estValide,
    validerChamp,
    validerTout,
    marquerTouché,
    reinitialiser,
    validateurs
  }
}
vue

<script setup>
import { useFormValidation } from '@/composables/useFormValidation'

const { champs, erreurs, touchés, estValide, validerTout, marquerTouché } = useFormValidation(
  // Valeurs initiales
  {
    nom: '',
    email: '',
    motDePasse: ''
  },
  // Règles
  {
    nom: [
      {
        validateur: (v) => v.length > 0,
        message: 'Le nom est requis'
      },
      {
        validateur: (v) => v.length >= 2,
        message: 'Le nom doit faire au moins 2 caractères'
      }
    ],
    email: [
      {
        validateur: (v) => v.length > 0,
        message: "L'email est requis"
      },
      {
        validateur: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Format d'email invalide"
      }
    ],
    motDePasse: [
      {
        validateur: (v) => v.length >= 8,
        message: 'Mot de passe : minimum 8 caractères'
      }
    ]
  }
)

function soumettre() {
  if (validerTout()) {
    console.log('Données valides:', champs.value)
    // Envoyer les données...
  }
}
</script>

<template>
  <form @submit.prevent="soumettre">
    <div>
      <input
        v-model="champs.nom"
        @blur="marquerTouché('nom')"
        placeholder="Nom"
      >
      <span v-if="touchés.nom && erreurs.nom?.length" class="erreur">
        {{ erreurs.nom[0] }}
      </span>
    </div>
    
    <div>
      <input
        v-model="champs.email"
        @blur="marquerTouché('email')"
        type="email"
        placeholder="Email"
      >
      <span v-if="touchés.email && erreurs.email?.length" class="erreur">
        {{ erreurs.email[0] }}
      </span>
    </div>
    
    <button type="submit" :disabled="!estValide">
      Créer le compte
    </button>
  </form>
</template>
useDebounce - Anti-rebond
<!-- TAG: debounce, useDebounce, recherche, performance, throttle -->
JavaScript

// src/composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(valeur, delai = 300) {
  const valeurDebounced = ref(valeur.value ?? valeur)
  let timer = null
  
  watch(
    () => (typeof valeur === 'object' && 'value' in valeur) ? valeur.value : valeur,
    (nouvelleValeur) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        valeurDebounced.value = nouvelleValeur
      }, delai)
    }
  )
  
  return valeurDebounced
}

// Version fonction debounce générique
export function useDebounceFunction(fn, delai = 300) {
  let timer = null
  
  function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delai)
  }
  
  function annuler() {
    clearTimeout(timer)
  }
  
  return { debounced, annuler }
}
vue

<script setup>
import { ref } from 'vue'
import { useDebounce } from '@/composables/useDebounce'
import { useFetch } from '@/composables/useFetch'

const recherche = ref('')
const rechercheDebounced = useDebounce(recherche, 500)

// La requête ne se fait qu'après 500ms d'inactivité
const { data: resultats, enChargement } = useFetch(
  computed(() => 
    rechercheDebounced.value
      ? `https://api.example.com/search?q=${rechercheDebounced.value}`
      : null
  )
)
</script>

<template>
  <input v-model="recherche" placeholder="Rechercher...">
  <span v-if="enChargement">Recherche...</span>
  <ul>
    <li v-for="res in resultats" :key="res.id">{{ res.nom }}</li>
  </ul>
</template>
usePagination
<!-- TAG: pagination, usePagination, page, pages -->
JavaScript

// src/composables/usePagination.js
import { ref, computed } from 'vue'

export function usePagination(items, itemsParPage = 10) {
  const pageCourante = ref(1)
  
  const totalPages = computed(() => 
    Math.ceil(items.value.length / itemsParPage)
  )
  
  const itemsPage = computed(() => {
    const debut = (pageCourante.value - 1) * itemsParPage
    const fin = debut + itemsParPage
    return items.value.slice(debut, fin)
  })
  
  const pages = computed(() => 
    Array.from({ length: totalPages.value }, (_, i) => i + 1)
  )
  
  function aller(page) {
    if (page >= 1 && page <= totalPages.value) {
      pageCourante.value = page
    }
  }
  
  function suivante() { aller(pageCourante.value + 1) }
  function precedente() { aller(pageCourante.value - 1) }
  
  const peutAllerSuivante = computed(() => pageCourante.value < totalPages.value)
  const peutAllerPrecedente = computed(() => pageCourante.value > 1)
  
  return {
    pageCourante,
    totalPages,
    itemsPage,
    pages,
    aller,
    suivante,
    precedente,
    peutAllerSuivante,
    peutAllerPrecedente
  }
}
text


---

## 📄 Fichier 6 : `javascript-fondamentaux.md`

```markdown
# JAVASCRIPT - FONDAMENTAUX
<!-- TAG: javascript, variables, types, fonctions, objets, tableaux, classes, destructuring, spread -->

## TABLE DES MATIÈRES
1. [Variables](#variables)
2. [Types de données](#types)
3. [Opérateurs](#operateurs)
4. [Structures conditionnelles](#conditionnelles)
5. [Boucles](#boucles)
6. [Fonctions](#fonctions)
7. [Objets](#objets)
8. [Tableaux](#tableaux)
9. [Destructuring](#destructuring)
10. [Spread & Rest](#spread-rest)
11. [Classes](#classes)
12. [Modules ES6](#modules)
13. [Template Literals](#template-literals)
14. [Optional Chaining & Nullish Coalescing](#optional-nullish)

---

## VARIABLES
<!-- TAG: let, const, var, variables, portée, hoisting, bloc -->

```javascript
// ===== VAR (ÉVITER - ancien style) =====
var x = 10        // Portée de fonction, hoisting, pas de bloc
var x = 20        // Redéclaration possible (problème!)

// ===== LET (pour valeurs qui changent) =====
let compteur = 0
compteur = 1        // ✅ Modification OK
// let compteur = 2 // ❌ Redéclaration dans le même scope : erreur

// Portée de bloc
{
  let y = 10
  console.log(y) // 10
}
// console.log(y) // ❌ ReferenceError : y n'existe pas ici

// ===== CONST (pour valeurs constantes - PRÉFÉRER) =====
const PI = 3.14159
// PI = 3          // ❌ TypeError : assignation à constante

// ⚠️ IMPORTANT : const ne rend pas les objets/tableaux immuables!
const personne = { nom: 'Alice', age: 28 }
personne.nom = 'Bob'           // ✅ Modification de propriété OK
personne.email = 'b@ex.com'    // ✅ Ajout de propriété OK
// personne = {}                // ❌ Réassignation : erreur

const nombres = [1, 2, 3]
nombres.push(4)     // ✅ Modification du tableau OK
nombres[0] = 10     // ✅ OK
// nombres = []     // ❌ Réassignation : erreur

// ===== RÈGLES RECOMMANDÉES =====
// 1. Utiliser const par défaut
// 2. Utiliser let si la variable change
// 3. Éviter var
Portée et Hoisting
JavaScript

// Hoisting avec var (déclaration remontée, pas l'initialisation)
console.log(maVar) // undefined (pas d'erreur!)
var maVar = 'valeur'

// Hoisting avec let/const (Temporal Dead Zone)
// console.log(maLet) // ❌ ReferenceError
let maLet = 'valeur'

// Hoisting des fonctions déclarées (entièrement hoistées)
direBonjour() // ✅ Fonctionne!
function direBonjour() { console.log('Bonjour!') }

// Fonctions expressions (pas hoistées)
// direAuRevoir() // ❌ TypeError
const direAuRevoir = function() { console.log('Au revoir!') }
TYPES DE DONNÉES
<!-- TAG: types, string, number, boolean, null, undefined, symbol, bigint, typeof -->
JavaScript

// ===== TYPES PRIMITIFS =====

// String
const nom = 'Alice'           // Guillemets simples
const prenom = "Bob"          // Guillemets doubles
const template = `Charlie`    // Template literal (backticks)

// Number (entiers ET décimaux)
const entier = 42
const decimal = 3.14
const negatif = -10
const infini = Infinity
const pasUnNombre = NaN
const binaire = 0b1010        // 10 en décimal
const octal = 0o17            // 15 en décimal
const hexadecimal = 0xFF      // 255 en décimal
const scientifique = 1e6      // 1 000 000
const grandNombre = 9007199254740991 // Number.MAX_SAFE_INTEGER

// BigInt (entiers très grands)
const grandEntier = 9007199254740992n
const autreBigInt = BigInt('123456789012345678901234567890')

// Boolean
const vrai = true
const faux = false

// Null (absence de valeur intentionnelle)
const aucuneValeur = null

// Undefined (variable déclarée mais pas assignée)
let nonDefini
console.log(nonDefini) // undefined

// Symbol (identifiant unique)
const sym1 = Symbol('description')
const sym2 = Symbol('description')
console.log(sym1 === sym2) // false (toujours unique!)

// ===== TYPE OBJECT =====
const objet = { nom: 'Alice' }
const tableau = [1, 2, 3]
const fonction = function() {}
const date = new Date()
const regex = /pattern/

// ===== VÉRIFICATION DE TYPES =====
typeof 42              // 'number'
typeof 'texte'         // 'string'
typeof true            // 'boolean'
typeof undefined       // 'undefined'
typeof null            // 'object' ⚠️ Bug historique!
typeof {}              // 'object'
typeof []              // 'object' (les tableaux sont des objets)
typeof function(){}    // 'function'
typeof Symbol()        // 'symbol'
typeof 42n             // 'bigint'

// Meilleure vérification pour les tableaux
Array.isArray([])      // true
Array.isArray({})      // false

// instanceof
[] instanceof Array    // true
{} instanceof Object   // true
new Date() instanceof Date // true

// Vérification null
const val = null
val === null           // true (strict equality)
val == undefined       // true (loose equality, null == undefined)
val == null            // true

// ===== CONVERSIONS DE TYPES =====

// String → Number
Number('42')       // 42
Number('3.14')     // 3.14
Number('')         // 0
Number('abc')      // NaN
parseInt('42px')   // 42
parseFloat('3.14kg') // 3.14
+'42'              // 42 (unary +)

// Number → String
String(42)         // '42'
(42).toString()    // '42'
(42).toString(2)   // '101010' (binaire)
(42).toString(16)  // '2a' (hexadécimal)
'' + 42            // '42'
`${42}`            // '42'

// → Boolean (falsy values)
Boolean(0)         // false
Boolean('')        // false
Boolean(null)      // false
Boolean(undefined) // false
Boolean(NaN)       // false
Boolean(false)     // false

Boolean(1)         // true
Boolean('texte')   // true
Boolean({})        // true (objet vide = true!)
Boolean([])        // true (tableau vide = true!)
OPÉRATEURS
<!-- TAG: opérateurs, comparaison, logique, ternaire, nullish, optional chaining -->
JavaScript

// ===== ARITHMÉTIQUES =====
5 + 3    // 8    Addition
5 - 3    // 2    Soustraction
5 * 3    // 15   Multiplication
5 / 3    // 1.67 Division
5 % 3    // 2    Modulo (reste)
5 ** 3   // 125  Puissance (ES2016)

// Assignation combinée
let x = 10
x += 5    // x = 15
x -= 3    // x = 12
x *= 2    // x = 24
x /= 4    // x = 6
x **= 2   // x = 36
x %= 5    // x = 1

// Incrément/Décrément
let n = 5
n++       // Post-incrément : retourne 5, puis n = 6
++n       // Pré-incrément : n = 7, retourne 7
n--       // Post-décrément : retourne 7, puis n = 6
--n       // Pré-décrément : n = 5, retourne 5

// ===== COMPARAISON =====
// ⚠️ Toujours utiliser === et !== (strict)
5 == '5'   // true  (conversion de type, ÉVITER)
5 === '5'  // false (strict, PRÉFÉRER)
5 !== '5'  // true
null == undefined  // true
null === undefined // false

5 > 3    // true
5 >= 5   // true
5 < 3    // false
5 <= 5   // true

// ===== LOGIQUES =====
true && false   // false (ET)
true || false   // true  (OU)
!true           // false (NON)

// Court-circuit
false && expensiveFunction()  // expensiveFunction() n'est PAS appelée
true || expensiveFunction()   // expensiveFunction() n'est PAS appelée

// Valeurs truthy/falsy avec ||
const nom = '' || 'Alice'         // 'Alice' ('' est falsy)
const config = null || { theme: 'light' }  // { theme: 'light' }

// ===== NULLISH COALESCING ?? (ES2020) =====
// Seulement null et undefined (pas les autres falsy)
const a = null ?? 'défaut'      // 'défaut'
const b = undefined ?? 'défaut' // 'défaut'
const c = 0 ?? 'défaut'         // 0 (0 n'est PAS null/undefined!)
const d = '' ?? 'défaut'        // '' (idem)
const e = false ?? 'défaut'     // false (idem)

// ===== OPTIONAL CHAINING ?. (ES2020) =====
const user = { 
  profil: { 
    nom: 'Alice',
    adresse: null
  } 
}

// Sans optional chaining (verbeux)
const ville = user && user.profil && user.profil.adresse && user.profil.adresse.ville

// Avec optional chaining (élégant)
const ville = user?.profil?.adresse?.ville     // undefined (pas d'erreur!)
const code = user?.profil?.adresse?.codePostal // undefined

// Avec tableaux
const premier = tableau?.[0]          // undefined si tableau est null/undefined

// Avec fonctions
const resultat = objet?.methode?.()   // undefined si methode n'existe pas

// Combinaison avec ??
const afficherVille = user?.profil?.adresse?.ville ?? 'Ville inconnue'

// ===== TERNAIRE =====
const age = 