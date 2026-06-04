<template>
  <div class="lc-view">

    <!-- HEADER -->
    <header class="page-header">
      <h1>🗂️ Mes ordinateurs locaux (SQLite)</h1>
      <p class="subtitle">
        Données stockées localement via Spring Boot + SQLite.
      </p>
    </header>

    <!-- IMPORT GLPI -->
    <ImportFromGlpi @imported="onImported" />

    <!-- TOOLBAR -->
    <div class="toolbar">
      <input
        v-model="store.searchQuery"
        type="search"
        placeholder="Rechercher..."
        class="search"
      />
      <button class="btn" @click="toggleForm">
        {{ showForm ? '✕ Fermer' : '➕ Nouveau' }}
      </button>
      <button class="btn" @click="store.fetchAll()">
        🔄 Actualiser
      </button>
    </div>

    <!-- FORMULAIRE -->
    <LocalComputerForm
      v-if="showForm"
      :initial-data="editingItem"
      :saving="store.saving"
      @submit="handleSubmit"
      @cancel="closeForm"
    />

    <!-- ERREUR -->
    <div v-if="store.error" class="error-box">
      ⚠️ {{ store.error }}
    </div>

    <!-- CHARGEMENT -->
    <div v-if="store.loading" class="state-box">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- VIDE -->
    <div v-else-if="store.filtered.length === 0" class="state-box">
      <p>😕 Aucun ordinateur local enregistré.</p>
    </div>

    <!-- LISTE -->
    <div v-else class="lc-list">
      <div
        v-for="item in store.filtered"
        :key="item.id"
        class="lc-card"
      >
        <div class="card-head">
          <span class="card-name">
            🖥️ {{ item.name }}
            <span v-if="item.importedFromGlpi" class="tag-glpi">
              GLPI #{{ item.glpiComputerId }}
            </span>
          </span>
          <span v-if="item.priority" :class="['priority', `p${item.priority}`]">
            P{{ item.priority }}
          </span>
        </div>

        <div class="card-body">
          <div class="row">
            <span class="lbl">Série :</span>
            <span class="val">{{ item.serial || '-' }}</span>
          </div>
          <div class="row" v-if="item.customTag">
            <span class="lbl">Tag :</span>
            <span class="val">{{ item.customTag }}</span>
          </div>
          <div class="row" v-if="item.localNote">
            <span class="lbl">Note :</span>
            <span class="val">{{ item.localNote }}</span>
          </div>
          <div class="row meta">
            <span>Créé : {{ formatDate(item.createdAt) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-small" @click="edit(item)">✏️ Modifier</button>
          <button class="btn-small btn-danger" @click="confirmDelete(item)">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocalComputerStore } from '@/stores/localComputerStore'
import LocalComputerForm from '@/components/localComputers/LocalComputerForm.vue'
import ImportFromGlpi    from '@/components/localComputers/ImportFromGlpi.vue'

const store       = useLocalComputerStore()
const showForm    = ref(false)
const editingItem = ref(null)

onMounted(() => {
  store.fetchAll()
})

function toggleForm() {
  if (showForm.value) {
    closeForm()
  } else {
    editingItem.value = null
    showForm.value    = true
  }
}

function closeForm() {
  showForm.value    = false
  editingItem.value = null
}

function edit(item) {
  editingItem.value = item
  showForm.value    = true
}

async function handleSubmit(data) {
  try {
    if (editingItem.value?.id) {
      await store.update(editingItem.value.id, data)
    } else {
      await store.create(data)
    }
    closeForm()
  } catch (e) {
    // L'erreur est déjà gérée par le store
  }
}

async function confirmDelete(item) {
  if (!confirm(`Supprimer "${item.name}" ?`)) return
  try {
    await store.remove(item.id)
  } catch (e) {
    alert('Erreur : ' + store.error)
  }
}

function onImported() {
  // Rafraîchir la liste après import
  // Pas besoin, le store ajoute déjà l'item
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR')
}
</script>

<style scoped>
.lc-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 6px;
}
.subtitle {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.search {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.btn {
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.btn:hover { background: #f3f4f6; }

.lc-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.lc-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 10px;
}
.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.tag-glpi {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 6px;
}
.priority {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 700;
  background: #e5e7eb;
}
.priority.p1 { background: #d1fae5; color: #065f46; }
.priority.p2 { background: #d1fae5; color: #065f46; }
.priority.p3 { background: #fef3c7; color: #92400e; }
.priority.p4 { background: #fee2e2; color: #991b1b; }
.priority.p5 { background: #fecaca; color: #7f1d1d; }

.row {
  display: flex;
  font-size: 13px;
  padding: 3px 0;
}
.lbl { color: #6b7280; min-width: 60px; }
.val { color: #111827; }
.meta {
  color: #9ca3af;
  font-size: 11px;
  margin-top: 6px;
  border-top: 1px dashed #f3f4f6;
  padding-top: 6px;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid #f3f4f6;
  padding-top: 10px;
}
.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
  cursor: pointer;
}
.btn-small:hover { background: #f3f4f6; }
.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.state-box {
  text-align: center;
  padding: 50px;
  color: #6b7280;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #0078d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  background: #fef2f2;
  border-left: 4px solid #dc2626;
  padding: 12px 16px;
  border-radius: 6px;
  color: #991b1b;
  margin-bottom: 16px;
}
</style>