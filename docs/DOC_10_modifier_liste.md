# ✏️ Modifier une ligne dans une liste

> ⚡ Comment ajouter un bouton "Modifier" sur chaque ligne d'une liste.

---

## 🎯 TABLEAU PRINCIPAL : 3 approches

| Approche | Quand l'utiliser | Difficulté |
|----------|------------------|-----------|
| 🪟 **Modal** (popup) | Beaucoup de champs | ⭐⭐ Moyen |
| ✏️ **Inline** (sur place) | Peu de champs (1-3) | ⭐⭐⭐ Avancé |
| 📄 **Page dédiée** | Très gros formulaire | ⭐ Facile |

---

## 🪟 1. APPROCHE MODAL (recommandée)

### Concept
- Clic "Modifier" → ouvre un popup
- L'utilisateur modifie
- Clic "Sauvegarder" → ferme et met à jour

### Exemple complet

```vue
<template>
  <div>
    <!-- ===== LISTE ===== -->
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Prix</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.price }} €</td>
          <td>
            <button @click="openEditModal(item)">✏️ Modifier</button>
            <button @click="deleteItem(item.id)">🗑️ Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ===== MODAL ===== -->
    <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>✏️ Modifier l'élément</h2>

        <div class="field">
          <label>Nom</label>
          <input v-model="modal.form.name" type="text" />
        </div>

        <div class="field">
          <label>Prix</label>
          <input v-model.number="modal.form.price" type="number" />
        </div>

        <div class="actions">
          <button @click="closeModal">Annuler</button>
          <button @click="saveChanges" class="btn-primary">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const items = ref([
  { id: 1, name: 'Produit A', price: 10 },
  { id: 2, name: 'Produit B', price: 20 },
])

// État du modal
const modal = reactive({
  show: false,
  form: { id: null, name: '', price: 0 }
})

// Ouvrir le modal avec les données de la ligne
function openEditModal(item) {
  // ⚠️ COPIE OBJET pour ne pas modifier directement
  modal.form = { ...item }
  modal.show = true
}

// Fermer le modal
function closeModal() {
  modal.show = false
}

// Sauvegarder les modifications
function saveChanges() {
  // Trouver l'index de l'item dans la liste
  const index = items.value.findIndex(i => i.id === modal.form.id)

  if (index !== -1) {
    // Remplacer l'item par les nouvelles valeurs
    items.value[index] = { ...modal.form }
  }

  closeModal()
}

function deleteItem(id) {
  if (!confirm('Supprimer ?')) return
  items.value = items.value.filter(i => i.id !== id)
}
</script>