<template>
  <div class="costs-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <h1>💰 Coûts par Type d'Élément</h1>
      <button @click="store.loadAll()" :disabled="store.loading">
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

      <!-- ===== KPI ===== -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">📊 Total GLPI</span>
          <span class="kpi-value">{{ formatMoney(store.totalGlpi) }}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">⭐ Total SuperCoûts</span>
          <span class="kpi-value">{{ formatMoney(store.totalSuperCout) }}</span>
        </div>

        <div class="kpi-card highlight">
          <span class="kpi-label">💎 GRAND TOTAL</span>
          <span class="kpi-value">{{ formatMoney(store.grandTotal) }}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">📦 Éléments</span>
          <span class="kpi-value">{{ store.totalItems }}</span>
        </div>
      </div>

      <!-- ===== TABLEAU ===== -->
      <div v-if="sortedTypes.length === 0" class="info-box">
        <p>📭 Aucun coût trouvé.</p>
      </div>

      <table v-else class="costs-table">
        <thead>
          <tr>
            <th>Type d'élément</th>
            <th>Items</th>
            <th>Tickets</th>
            <th>Coût GLPI</th>
            <th>SuperCoût</th>
            <th>TOTAL</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="type in sortedTypes" :key="type.type">
            <td>
              {{ getIcon(type.type) }} <strong>{{ getLabel(type.type) }}</strong>
            </td>
            <td>{{ type.count }}</td>
            <td>{{ type.ticketsCount }}</td>
            <td>{{ formatMoney(type.coutGlpi) }}</td>
            <td>{{ formatMoney(type.superCout) }}</td>
            <td><strong>{{ formatMoney(type.total) }}</strong></td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td colspan="3"><strong>TOTAL GÉNÉRAL</strong></td>
            <td>{{ formatMoney(store.totalGlpi) }}</td>
            <td>{{ formatMoney(store.totalSuperCout) }}</td>
            <td><strong>{{ formatMoney(store.grandTotal) }}</strong></td>
          </tr>
        </tfoot>
      </table>

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

const sortedTypes = computed(() => {
  return [...store.costsByType].sort((a, b) => b.total - a.total)
})

function formatMoney(value) {
  const n = parseFloat(value) || 0
  return `${n.toFixed(2)} €`
}

function getIcon(itemtype) {
  const icons = {
    'Computer'        : '💻',
    'Monitor'         : '🖥️',
    'Printer'         : '🖨️',
    'Phone'           : '📞',
    'NetworkEquipment': '🌐',
    'Peripheral'      : '⌨️',
    'Rack'            : '🗄️',
    'Software'        : '💿',
  }
  return icons[itemtype] || '📦'
}

function getLabel(itemtype) {
  const labels = {
    'Computer'        : 'Ordinateurs',
    'Monitor'         : 'Écrans',
    'Printer'         : 'Imprimantes',
    'Phone'           : 'Téléphones',
    'NetworkEquipment': 'Équipements réseau',
    'Peripheral'      : 'Périphériques',
    'Software'        : 'Logiciels',
  }
  return labels[itemtype] || itemtype
}
</script>

<style scoped>
/* LAYOUT */
.costs-view {
  padding: 20px;
  max-width: 1100px;
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
.page-header button {
  background: #fff;
  color: #10b981;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* INFO BOX */
.info-box {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
}
.info-box.error {
  background: #fee2e2;
  color: #991b1b;
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 4px solid #10b981;
}
.kpi-card.highlight {
  background: #d1fae5;
}
.kpi-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
.kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

/* TABLE */
.costs-table {
  width: 100%;
  background: #fff;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
}

.costs-table th {
  background: #10b981;
  color: #fff;
  padding: 12px;
  text-align: left;
  font-size: 13px;
}

.costs-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.costs-table tbody tr:hover {
  background: #f0fdf4;
}

.costs-table tfoot td {
  background: #f9fafb;
  font-weight: 700;
}

/* RESPONSIVE */
@media (max-width: 800px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>