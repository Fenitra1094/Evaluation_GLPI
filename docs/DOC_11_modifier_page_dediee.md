📄 DOC_11_modifier_page_dediee.md
Markdown

# 📄 Modifier dans une page dédiée

> ⚡ Cliquer "Modifier" → aller vers une page de modification.

---

## 🎯 PRINCIPE
Page LISTE Page ÉDITION
┌──────────┐ ┌──────────┐
│ Produit A│ │ ✏️ Edit │
│ [✏️ Edit]│ ────────→ │ │
└──────────┘ │ Nom:[__] │
│ Prix:[_] │
│ [Save] │
└──────────┘

text


---

## 📋 LES 4 ÉTAPES

| Étape | Quoi faire |
|-------|-----------|
| 1️⃣ | Créer la **route** dynamique avec `:id` |
| 2️⃣ | Bouton "Modifier" qui **redirige** avec l'id |
| 3️⃣ | Créer la **page d'édition** qui charge l'item |
| 4️⃣ | Bouton "Enregistrer" qui **save + retour** |

---

## 1️⃣ AJOUTER LA ROUTE

📂 `src/router/index.js`

Dans `children: [...]` de `/main` :

```javascript
{
  path: '/items/:id/edit',           // ⭐ :id = paramètre dynamique
  name: 'edit-item',
  component: () => import('@/views/EditItemView.vue'),
  meta: { title: 'Modifier élément' }
}
💡 Explication
:id = paramètre dynamique (peut être 1, 2, 42...)
URL exemple : /items/42/edit
Accessible via route.params.id
2️⃣ BOUTON "MODIFIER" DANS LA LISTE
vue

<template>
  <table>
    <tr v-for="item in store.items" :key="item.id">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>
        <!-- ⭐ Bouton qui redirige -->
        <button @click="goToEdit(item.id)">
          ✏️ Modifier
        </button>
      </td>
    </tr>
  </table>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/itemsStore'

const router = useRouter()
const store  = useItemsStore()

function goToEdit(id) {
  // ⭐ Redirection avec l'id en paramètre
  router.push({ name: 'edit-item', params: { id } })

  // OU avec le chemin direct
  // router.push(`/items/${id}/edit`)
}
</script>
💡 2 façons de rediriger
JavaScript

// Méthode 1 : par nom (recommandé)
router.push({ name: 'edit-item', params: { id: 42 } })

// Méthode 2 : par URL
router.push('/items/42/edit')
3️⃣ CRÉER LA PAGE D'ÉDITION
📂 src/views/EditItemView.vue

vue

<template>
  <div class="edit-page">

    <!-- HEADER avec bouton retour -->
    <header class="page-header">
      <button class="btn-back" @click="goBack">← Retour</button>
      <div>
        <h1>✏️ Modifier l'élément #{{ form.id }}</h1>
        <p>Modifiez les informations puis sauvegardez</p>
      </div>
    </header>

    <!-- LOADING -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- ERREUR -->
    <div v-else-if="error" class="error">
      ❌ {{ error }}
    </div>

    <!-- FORMULAIRE -->
    <form v-else @submit.prevent="saveChanges" class="edit-form">

      <div class="field">
        <label>Nom <span class="req">*</span></label>
        <input v-model="form.name" type="text" required />
      </div>

      <div class="field">
        <label>Prix (€)</label>
        <input v-model.number="form.price" type="number" step="0.01" min="0" />
      </div>

      <div class="field">
        <label>Stock</label>
        <input v-model.number="form.stock" type="number" min="0" />
      </div>

      <div class="field">
        <label>Description</label>
        <textarea v-model="form.description" rows="4"></textarea>
      </div>

      <!-- BOUTONS -->
      <div class="actions">
        <button type="button" class="btn" @click="goBack">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? '⏳ Sauvegarde...' : '💾 Enregistrer' }}
        </button>
      </div>

    </form>

    <!-- TOAST SUCCÈS -->
    <div v-if="successMsg" class="success-toast">
      ✅ {{ successMsg }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/itemsStore'

const route  = useRoute()
const router = useRouter()
const store  = useItemsStore()

// ============ STATE ============
const loading    = ref(true)
const saving     = ref(false)
const error      = ref(null)
const successMsg = ref('')

// Formulaire pré-rempli
const form = reactive({
  id         : null,
  name       : '',
  price      : 0,
  stock      : 0,
  description: ''
})

// ============ LIFECYCLE ============
onMounted(async () => {
  await loadItem()
})

// ============ ACTIONS ============

/** Charger l'item depuis l'API */
async function loadItem() {
  loading.value = true
  error.value   = null

  try {
    const id = route.params.id        // ⭐ Récupérer l'id de l'URL

    // Charger depuis le store (qui appelle l'API)
    const item = await store.getById(id)

    if (!item) {
      error.value = 'Élément introuvable'
      return
    }

    // Remplir le formulaire
    Object.assign(form, item)

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

/** Sauvegarder les modifications */
async function saveChanges() {
  if (!form.name.trim()) {
    alert('Le nom est obligatoire')
    return
  }

  saving.value = true

  try {
    const ok = await store.updateItem(form.id, form)

    if (ok) {
      successMsg.value = '✅ Modifications enregistrées !'

      // Attendre 1.5s puis retourner à la liste
      setTimeout(() => {
        router.push({ name: 'items' })
      }, 1500)
    }
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

/** Retour à la liste */
function goBack() {
  router.push({ name: 'items' })

  // OU pour revenir simplement en arrière
  // router.back()
}
</script>

<style scoped>
.edit-page {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #fff;
  padding: 25px 30px;
  border-radius: 16px;
  margin-bottom: 25px;
}

.btn-back {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.btn-back:hover { background: rgba(255,255,255,0.25); }

.page-header h1 { margin: 0; font-size: 22px; }
.page-header p  { margin: 4px 0 0 0; opacity: 0.8; font-size: 13px; }

.loading, .error {
  background: #fff;
  padding: 60px;
  border-radius: 16px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error {
  color: #991b1b;
  background: #fee2e2;
}

.edit-form {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
}

.field input,
.field textarea {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}

.field input:focus,
.field textarea:focus {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.field textarea {
  resize: vertical;
  min-height: 80px;
}

.req { color: #ef4444; }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.btn:hover { background: #f3f4f6; }

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  border-color: #1e3a8a;
}

.success-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #d1fae5;
  color: #065f46;
  padding: 14px 20px;
  border-radius: 10px;
  border-left: 4px solid #10b981;
  font-weight: 600;
  z-index: 1000;
}
</style>
4️⃣ STORE : méthode getById et updateItem
📂 src/stores/itemsStore.js

JavaScript

import { defineStore } from 'pinia'
import { ref } from 'vue'
import LocalClient from '@/api/localClient'

export const useItemsStore = defineStore('items', () => {
  const items = ref([])
  const saving = ref(false)

  // ⭐ Récupérer un item par ID
  async function getById(id) {
    // Méthode 1 : depuis la liste locale (si déjà chargée)
    const local = items.value.find(i => i.id === Number(id))
    if (local) return local

    // Méthode 2 : depuis l'API
    return await LocalClient.getById(id)
  }

  // ⭐ Modifier un item
  async function updateItem(id, data) {
    saving.value = true
    try {
      const updated = await LocalClient.update(id, data)

      // Mettre à jour dans la liste locale
      const index = items.value.findIndex(i => i.id === Number(id))
      if (index !== -1) {
        items.value[index] = updated
      }

      return true
    } catch (err) {
      console.error('Erreur update :', err)
      return false
    } finally {
      saving.value = false
    }
  }

  return { items, saving, getById, updateItem }
})