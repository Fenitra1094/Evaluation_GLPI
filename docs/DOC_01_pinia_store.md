# Pinia Store : créer, utiliser, modifier

Comment marche un store Pinia dans ton projet GLPI NewApp.

## 1. Structure d'un store

Tous tes stores sont dans `src/stores/`.

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMonStore = defineStore('monStore', () => {

  // ---- STATE (données) ----
  const items   = ref([])
  const loading = ref(false)

  // ---- GETTERS (calculs auto) ----
  const total = computed(() => items.value.length)

  // ---- ACTIONS (fonctions) ----
  async function loadItems() {
    loading.value = true
    items.value = await fetch('...')
    loading.value = false
  }

  // ---- RETURN obligatoire ----
  return {
    items, loading,        // state
    total,                  // getter
    loadItems,              // action
  }
})