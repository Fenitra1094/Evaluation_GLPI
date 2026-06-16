<template>
  <div class="costs-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <h1>💰 Coûts par Catégorie</h1>
      <button @click="store.loadAll()" :disabled="store.loading" class="btn-refresh">
        🔄 Actualiser
      </button>
    </header>

    <!-- ===== LOADING ===== -->
    <div v-if="store.loading" class="info-box">
      <p>⏳ {{ store.loadingLabel }}</p>
    </div>

    <!-- ===== ERREUR ===== -->
    <div v-else-if="store.error" class="info-box error">
      ❌ {{ store.error }}
    </div>

    <template v-else>

      <!-- ===== KPI GLOBAUX ===== -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-glpi">
          <span class="kpi-label">📊 GLPI</span>
          <span class="kpi-value">{{ formatMoney(store.totalByType.GLPI) }}</span>
        </div>
        <div class="kpi-card kpi-saisi">
          <span class="kpi-label">✍️ Saisi</span>
          <span class="kpi-value">{{ formatMoney(store.totalByType.SAISI) }}</span>
        </div>
        <div class="kpi-card kpi-reouv">
          <span class="kpi-label">🔄 Réouverture</span>
          <span class="kpi-value">{{ formatMoney(store.totalByType.REOUVERTURE) }}</span>
        </div>
        <div class="kpi-card kpi-cancel">
          <span class="kpi-label">❌ Cancel</span>
          <span class="kpi-value">{{ formatMoney(store.totalByType.CANCEL) }}</span>
        </div>
        <div class="kpi-card highlight">
          <span class="kpi-label">💎 GRAND TOTAL</span>
          <span class="kpi-value">{{ formatMoney(store.grandTotal) }}</span>
        </div>
      </div>

      <!-- ===== VUE PAR CATÉGORIE ===== -->
      <div v-if="!store.selectedCategory">
        <h2 class="section-title">📂 Cliquez sur une catégorie pour voir le détail</h2>

        <div v-if="sortedCategories.length === 0" class="info-box">
          <p>📭 Aucun coût trouvé.</p>
        </div>

        <div v-else class="categories-grid">
          <div
            v-for="cat in sortedCategories"
            :key="cat.category"
            class="category-card"
            @click="store.selectCategory(cat.category)"
          >
            <div class="cat-header">
              <span class="cat-icon">{{ getIcon(cat.category) }}</span>
              <span class="cat-name">{{ getLabel(cat.category) }}</span>
            </div>

            <div class="cat-total">{{ formatMoney(cat.total) }}</div>

            <div class="cat-stats">
              <span>{{ cat.itemsCount }} item{{ cat.itemsCount > 1 ? 's' : '' }}</span>
              <span>{{ cat.count }} mouvement{{ cat.count > 1 ? 's' : '' }}</span>
            </div>

            <div class="cat-breakdown">
              <span v-if="cat.totalGlpi"        class="bk bk-glpi">  GLPI : {{ formatMoney(cat.totalGlpi) }}</span>
              <span v-if="cat.totalSaisi"       class="bk bk-saisi"> ✍️ {{ formatMoney(cat.totalSaisi) }}</span>
              <span v-if="cat.totalReouverture" class="bk bk-reouv"> 🔄 {{ formatMoney(cat.totalReouverture) }}</span>
              <span v-if="cat.totalCancel"      class="bk bk-cancel">❌ {{ formatMoney(cat.totalCancel) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== VUE DÉTAILLÉE (items d'une catégorie) ===== -->
      <div v-else>
        <button @click="store.clearSelection()" class="btn-back">
          ← Retour aux catégories
        </button>

        <h2 class="section-title">
          {{ getIcon(store.selectedCategory) }} {{ getLabel(store.selectedCategory) }} —
          Détails des coûts par item
        </h2>

        <div v-if="store.detailsForSelectedCategory.length === 0" class="info-box">
          <p>📭 Aucun item trouvé pour cette catégorie.</p>
        </div>

        <div v-else class="items-list">
          <div
            v-for="item in store.detailsForSelectedCategory"
            :key="item.itemId"
            class="item-card"
          >
            <div class="item-header">
              <div class="item-info">
                <strong>{{ item.itemName }}</strong>
                <small>#{{ item.itemId }}</small>
              </div>
              <div class="item-total">{{ formatMoney(item.total) }}</div>
            </div>

            <table class="mouvements-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mvt in item.mouvements" :key="mvt.id">
                  <td>
                    <span class="type-badge" :class="`badge-${mvt.type.toLowerCase()}`">
                      {{ getTypeIcon(mvt.type) }} {{ mvt.type }}
                    </span>
                  </td>
                  <td :class="{ 'negative': mvt.cout < 0 }">
                    {{ formatMoney(mvt.cout) }}
                  </td>
                  <td class="date-cell">{{ formatDate(mvt.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCostsByTypeStore } from '@/stores/FrontOffice/costsByTypeStore'

const store = useCostsByTypeStore()

onMounted(() => {
  store.loadAll()
})

const sortedCategories = computed(() => {
  return [...store.costsByCategory].sort((a, b) => b.total - a.total)
})

function formatMoney(value) {
  const n = parseFloat(value) || 0
  return `${n.toFixed(3)} €`
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getIcon(itemtype) {
  const icons = {
    Computer        : '💻',
    Monitor         : '🖥️',
    Printer         : '🖨️',
    Phone           : '📞',
    NetworkEquipment: '🌐',
    Peripheral      : '⌨️',
    Rack            : '🗄️',
    Software        : '💿',
  }
  return icons[itemtype] || '📦'
}

function getLabel(itemtype) {
  const labels = {
    Computer        : 'Ordinateurs',
    Monitor         : 'Écrans',
    Printer         : 'Imprimantes',
    Phone           : 'Téléphones',
    NetworkEquipment: 'Réseau',
    Peripheral      : 'Périphériques',
    Software        : 'Logiciels',
  }
  return labels[itemtype] || itemtype
}

function getTypeIcon(type) {
  const icons = {
    GLPI        : '📊',
    SAISI       : '✍️',
    REOUVERTURE : '🔄',
    CANCEL      : '❌',
  }
  return icons[type] || '•'
}
</script>

<style scoped>
.costs-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #10b981;
  color: #fff;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.page-header h1 { margin: 0; font-size: 20px; }

.btn-refresh {
  background: #fff;
  color: #10b981;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-back {
  background: #fff;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 15px;
}
.btn-back:hover { background: #f3f4f6; }

.info-box {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}
.info-box.error { background: #fee2e2; color: #991b1b; }

.section-title {
  font-size: 16px;
  margin: 20px 0 12px 0;
  color: #1a1a2e;
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 4px solid #94a3b8;
}
.kpi-glpi   { border-left-color: #10b981; }
.kpi-saisi  { border-left-color: #3b82f6; }
.kpi-reouv  { border-left-color: #9333ea; }
.kpi-cancel { border-left-color: #ef4444; }
.kpi-card.highlight {
  background: #d1fae5;
  border-left-color: #047857;
}

.kpi-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}
.kpi-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}

/* CATÉGORIES (grille de cartes cliquables) */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.category-card {
  background: #fff;
  padding: 18px;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.category-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.cat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.cat-icon { font-size: 28px; }
.cat-name { font-size: 16px; font-weight: 700; color: #1a1a2e; }

.cat-total {
  font-size: 28px;
  font-weight: 800;
  color: #047857;
  margin-bottom: 10px;
}

.cat-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
}

.cat-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
}
.bk {
  padding: 3px 8px;
  border-radius: 100px;
  font-weight: 600;
}
.bk-glpi   { background: #d1fae5; color: #065f46; }
.bk-saisi  { background: #dbeafe; color: #1e40af; }
.bk-reouv  { background: #f3e8ff; color: #6b21a8; }
.bk-cancel { background: #fee2e2; color: #991b1b; }

/* DÉTAIL ITEMS */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.item-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.item-header {
  background: #f9fafb;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.item-info {
  display: flex;
  flex-direction: column;
}
.item-info strong { font-size: 15px; color: #1a1a2e; }
.item-info small { font-size: 11px; color: #9ca3af; }

.item-total {
  font-size: 20px;
  font-weight: 700;
  color: #047857;
}

.mouvements-table {
  width: 100%;
  border-collapse: collapse;
}

.mouvements-table th {
  background: #f3f4f6;
  padding: 8px 14px;
  text-align: left;
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 700;
}

.mouvements-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.mouvements-table tbody tr:last-child td { border-bottom: none; }
.mouvements-table tbody tr:hover { background: #f9fafb; }

.date-cell {
  color: #9ca3af;
  font-size: 12px;
}

.negative { color: #dc2626; font-weight: 700; }

/* TYPE BADGES */
.type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}
.badge-glpi        { background: #d1fae5; color: #065f46; }
.badge-saisi       { background: #dbeafe; color: #1e40af; }
.badge-reouverture { background: #f3e8ff; color: #6b21a8; }
.badge-cancel      { background: #fee2e2; color: #991b1b; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>