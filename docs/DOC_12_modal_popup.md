# DOC_12_modal_popup.md

# Modal / Popup dans Vue 3

Les modals servent à afficher :

* détails
* formulaires
* confirmations
* alertes

## 1. Ouvrir un popup

```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)

function openModal() {
  showModal.value = true
}
</script>

<template>
  <button @click="openModal">
    Ouvrir
  </button>

  <div v-if="showModal">
    Popup
  </div>
</template>
```

---

## 2. Fermer un popup

```js
function closeModal() {
  showModal.value = false
}
```

```vue
<button @click="closeModal">
  Fermer
</button>
```

---

## 3. Popup complet

```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<template>

  <button @click="showModal = true">
    Voir détails
  </button>

  <div
    v-if="showModal"
    class="modal"
  >
    <div class="modal-content">

      <h3>Détails du ticket</h3>

      <button @click="showModal = false">
        Fermer
      </button>

    </div>
  </div>

</template>
```

---

## 4. Envoyer un objet au popup

### Sélection

```js
const selectedTicket = ref(null)

function selectTicket(ticket) {
  selectedTicket.value = ticket
  showModal.value = true
}
```

---

### Affichage

```vue
<h3>{{ selectedTicket.name }}</h3>
<p>{{ selectedTicket.content }}</p>
```

---

## 5. Transition (animation)

```vue
<transition name="slide-modal">

  <div v-if="showModal">
    ...
  </div>

</transition>
```

---

## CSS associé

```css
.slide-modal-enter-active,
.slide-modal-leave-active {
  transition: all 0.3s ease;
}

.slide-modal-enter-from,
.slide-modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
```

Effet :

* apparition
* disparition
* effet pop

---

## 6. Fermer en cliquant sur le fond

```vue
<div
  class="modal"
  @click="showModal = false"
>

  <div
    class="modal-content"
    @click.stop
  >
    contenu
  </div>

</div>
```

`@click.stop` empêche la fermeture lorsque l'on clique dans le contenu.

---

## À retenir

Ouvrir :

```js
showModal.value = true
```

Fermer :

```js
showModal.value = false
```

Afficher :

```vue
<div v-if="showModal">
```

Animation :

```vue
<transition>
```
