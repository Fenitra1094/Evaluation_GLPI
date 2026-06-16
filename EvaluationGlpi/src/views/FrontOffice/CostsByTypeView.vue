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
          <span class="kpi-label">✍️ Saisi (net)</span>
          <span class="kpi-value">{{ formatMoney(saisiNet) }}</span>
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

      <!-- ===== VUE TABLEAU (par catégorie) ===== -->
      <div v-if="!store.selectedCategory">
        <h2 class="section-title">📊 Récapitulatif par catégorie</h2>

        <div v-if="sortedCategories.length === 0" class="info-box">
          <p>📭 Aucun coût trouvé.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="costs-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th class="num">Items</th>
                <th class="num">📊 GLPI</th>
                <th class="num">✍️ SAISI</th>
                <th class="num">🔄 REOUVERTURE</th>
                <th class="num">❌ CANCEL</th>
                <th class="num total-col">💎 TOTAL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cat in sortedCategories"
                :key="cat.category"
                class="cat-row"
                @click="store.selectCategory(cat.category)"
              >
                <td class="cat-name-cell">
                  <span class="cat-icon">{{ getIcon(cat.category) }}</span>
                  <strong>{{ getLabel(cat.category) }}</strong>
                </td>
                <td class="num">{{ cat.itemsCount }}</td>
                <td class="num glpi">{{ formatMoney(cat.totalGlpi) }}</td>
                <td class="num saisi">{{ formatMoney(cat.totalSaisi) }}</td>
                <td class="num reouv">{{ formatMoney(cat.totalReouverture) }}</td>
                <td class="num cancel">{{ formatMoney(cat.totalCancel) }}</td>
                <td class="num total-col"><strong>{{ formatMoney(cat.total) }}</strong></td>
                <td class="action-cell">
                  <span class="btn-detail">Voir détails →</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td><strong>TOTAL GÉNÉRAL</strong></td>
                <td class="num">{{ totalItems }}</td>
                <td class="num glpi"><strong>{{ formatMoney(store.totalByType.GLPI) }}</strong></td>
                <td class="num saisi"><strong>{{ formatMoney(store.totalByType.SAISI) }}</strong></td>
                <td class="num reouv"><strong>{{ formatMoney(store.totalByType.REOUVERTURE) }}</strong></td>
                <td class="num cancel"><strong>{{ formatMoney(store.totalByType.CANCEL) }}</strong></td>
                <td class="num total-col"><strong>{{ formatMoney(store.grandTotal) }}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ===== VUE DÉTAILLÉE (items d'une catégorie) ===== -->
      <div v-else>
        <button @click="store.clearSelection()" class="btn-back">
          ← Retour au tableau
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
                  <th class="num">Montant</th>
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
                  <td class="num" :class="{ 'negative': mvt.cout < 0 }">
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

// ⭐ Saisi NET = Saisi - Cancel (en valeur absolue, vu que cancel est négatif)
const saisiNet = computed(() => {
  return store.totalByType.SAISI + store.totalByType.CANCEL
  // Cancel est déjà négatif dans la base, donc on ADDITIONNE
})

// Nombre total d'items uniques
const totalItems = computed(() => {
  return sortedCategories.value.reduce((sum, c) => sum + c.itemsCount, 0)
})

function formatMoney(value) {
  const n = parseFloat(value) || 0
  return `${n.toFixed(2)} €`
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

/* ===== TABLEAU PRINCIPAL ===== */
.table-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.costs-table {
  width: 100%;
  border-collapse: collapse;
}

.costs-table thead {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
}

.costs-table thead th {
  padding: 14px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.costs-table thead th.num { text-align: right; }
.costs-table thead th.total-col {
  background: rgba(255,255,255,0.1);
}

.costs-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
}
.costs-table tbody tr:hover {
  background: #f9fafb;
}
.costs-table tbody tr:last-child {
  border-bottom: none;
}

.costs-table td {
  padding: 14px 12px;
  font-size: 13px;
  color: #1a1a2e;
}
.costs-table td.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cat-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cat-icon { font-size: 22px; }

/* Couleurs des colonnes */
.costs-table td.glpi    { color: #047857; }
.costs-table td.saisi   { color: #1e40af; }
.costs-table td.reouv   { color: #6b21a8; }
.costs-table td.cancel  { color: #dc2626; }
.costs-table td.total-col {
  background: #f0fdf4;
  font-size: 14px;
  color: #047857;
}

.action-cell {
  text-align: right;
}
.btn-detail {
  background: #1e3a8a;
  color: #fff;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* Ligne TOTAL en bas */
.total-row {
  background: linear-gradient(135deg, #047857, #10b981) !important;
  color: #fff !important;
}
.total-row td {
  padding: 16px 12px !important;
  color: #fff !important;
  font-size: 14px;
}
.total-row td.total-col {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
  font-size: 15px;
}
.total-row td.glpi,
.total-row td.saisi,
.total-row td.reouv,
.total-row td.cancel {
  color: #fff !important;
}

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
.mouvements-table th.num { text-align: right; }

.mouvements-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.mouvements-table td.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
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
  .table-wrapper { overflow-x: auto; }
}
</style>