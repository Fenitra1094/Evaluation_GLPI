<template>
  <div class="computers-view">

    <!-- ======= HEADER ======= -->
    <div class="page-header">
      <h1>🖥️ Ordinateurs</h1>
      <span class="total-badge">{{ store.totalCount }} résultats</span>
    </div>

    <!-- ======= BARRE DE RECHERCHE ======= -->
    <div class="toolbar">
      <input
        v-model="store.searchQuery"
        type="search"
        placeholder="Rechercher par nom, série, fabricant..."
        class="search-input"
      />
      <button class="btn-refresh" @click="store.fetchComputers()">
        🔄 Actualiser
      </button>
    </div>

    <!-- ======= ÉTAT : CHARGEMENT ======= -->
    <div v-if="store.loading" class="state-box">
      <div class="spinner"></div>
      <p>Chargement des ordinateurs...</p>
    </div>

    <!-- ======= ÉTAT : ERREUR ======= -->
    <div v-else-if="store.error" class="state-box error">
      <p>⚠️ {{ store.error }}</p>
      <button class="btn-refresh" @click="store.fetchComputers()">
        Réessayer
      </button>
    </div>

    <!-- ======= ÉTAT : VIDE ======= -->
    <div v-else-if="store.filteredComputers.length === 0" class="state-box">
      <p>😕 Aucun ordinateur trouvé.</p>
    </div>

    <!-- ======= LISTE ======= -->
    <div v-else class="computers-grid">
      <ComputerCard
        v-for="computer in store.filteredComputers"
        :key="computer.id"
        :computer="computer"
        @select="goToDetail"
      />
    </div>

    <!-- ======= PAGINATION ======= -->
    <div v-if="store.totalPages > 1" class="pagination">
      <button
        :disabled="store.currentPage === 0"
        class="btn-page"
        @click="store.setPage(store.currentPage - 1)"
      >
        ← Précédent
      </button>

      <span class="page-info">
        Page {{ store.currentPage + 1 }} / {{ store.totalPages }}
      </span>

      <button
        :disabled="store.currentPage >= store.totalPages - 1"
        class="btn-page"
        @click="store.setPage(store.currentPage + 1)"
      >
        Suivant →
      </button>
    </div>

  </div>
</template>

<script setup>
import { onMounted }        from 'vue'
import { useRouter }        from 'vue-router'
import { useComputerStore } from '@/stores/computerStore'
import ComputerCard         from '@/components/Computers/ComputerCard.vue'

const store  = useComputerStore()
const router = useRouter()

// Chargement au montage du composant
onMounted(() => {
  store.fetchComputers()
})

// Navigation vers le détail
function goToDetail(id) {
  router.push({ name: 'computer-detail', params: { id } })
}
</script>

<style scoped>
.computers-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}
.total-badge {
  background: #0078d4;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color .2s;
}
.search-input:focus { border-color: #0078d4; }

.btn-refresh {
  padding: 10px 18px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background .2s;
}
.btn-refresh:hover { background: #005fa3; }

/* Grid */
.computers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* States */
.state-box {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}
.state-box.error { color: #dc2626; }

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #0078d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}
.btn-page {
  padding: 8px 18px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all .2s;
}
.btn-page:hover:not(:disabled) {
  background: #0078d4;
  color: #fff;
  border-color: #0078d4;
}
.btn-page:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: 14px; color: #374151; }
</style>