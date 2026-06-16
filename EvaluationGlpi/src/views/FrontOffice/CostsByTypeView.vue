<template>
  <div class="costs-view">

    <!-- HEADER -->
    <header class="page-header">
      <h1>💰 Détail des Coûts</h1>
      <div class="header-actions">
        <button @click="viewMode = 'aggregated'" :class="{ active: viewMode === 'aggregated' }">
          📊 Vue Agrégée
        </button>
        <button @click="viewMode = 'detailed'" :class="{ active: viewMode === 'detailed' }">
          📋 Vue Détaillée
        </button>
        <button @click="store.loadAll()" :disabled="store.loading" class="btn-refresh">
          🔄 Actualiser
        </button>
      </div>
    </header>

    <!-- LOADING -->
    <div v-if="store.loading" class="info-box">
      <p>⏳ {{ store.loadingLabel }}</p>
    </div>

    <!-- ERREUR -->
    <div v-else-if="store.error" class="info-box error">
      ❌ {{ store.error }}
    </div>

    <template v-else>

      <!-- KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">📊 Total GLPI</span>
          <span class="kpi-value">{{ formatMoney(store.totalGlpi) }}</span>
        </div>

        <div class="kpi-card kpi-saisi">
          <span class="kpi-label">✍️ Coût Saisi</span>
          <span class="kpi-value">{{ formatMoney(store.totalCoutSaisi) }}</span>
        </div>

        <div class="kpi-card kpi-reouv">
          <span class="kpi-label">🔄 Coût Réouverture</span>
          <span class="kpi-value">{{ formatMoney(store.totalCoutReouverture) }}</span>
        </div>

        <div class="kpi-card highlight">
          <span class="kpi-label">💎 GRAND TOTAL</span>
          <span class="kpi-value">{{ formatMoney(store.grandTotal) }}</span>
        </div>
      </div>

      <!-- ===== VUE AGRÉGÉE ===== -->
      <div v-if="viewMode === 'aggregated'">
        <h2 class="section-title">📊 Vue par Type d'Élément</h2>

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
              <th>✍️ Saisi</th>
              <th>🔄 Réouverture</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in sortedTypes" :key="type.type">
              <td>{{ getIcon(type.type) }} <strong>{{ getLabel(type.type) }}</strong></td>
              <td>{{ type.count }}</td>
              <td>{{ type.ticketsCount }}</td>
              <td>{{ formatMoney(type.coutGlpi) }}</td>
              <td class="cout-saisi">{{ formatMoney(type.coutSaisi) }}</td>
              <td class="cout-reouv">{{ formatMoney(type.coutReouverture) }}</td>
              <td><strong>{{ formatMoney(type.total) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== VUE DÉTAILLÉE (avec type de coût) ===== -->
      <div v-else>
        <h2 class="section-title">📋 Liste détaillée des coûts</h2>

        <!-- FILTRES -->
        <div class="filters">
          <input
            v-model="search"
            type="text"
            placeholder="🔍 Rechercher (ticket, item)..."
            class="search-input"
          />

          <select v-model="filterType">
            <option value="all">Tous les types</option>
            <option value="SAISI">✍️ Saisi uniquement</option>
            <option value="REOUVERTURE">🔄 Réouverture uniquement</option>
          </select>
        </div>

        <div v-if="filteredDetails.length === 0" class="info-box">
          <p>📭 Aucun coût trouvé.</p>
        </div>

        <table v-else class="costs-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Type Item</th>
              <th>Élément</th>
              <th>Type Coût</th>
              <th>Montant Total</th>
              <th>Part (÷ items)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(detail, i) in filteredDetails" 
              :key="i"
              :class="{ 'row-saisi': detail.type === 'SAISI', 'row-reouv': detail.type === 'REOUVERTURE' }"
            >
              <td><strong>#{{ detail.ticketId }}</strong></td>
              <td>{{ getIcon(detail.itemtype) }} {{ getLabel(detail.itemtype) }}</td>
              <td>{{ detail.itemName }}</td>
              <td>
                <span class="type-badge" :class="`badge-${detail.type.toLowerCase()}`">
                  {{ detail.type === 'SAISI' ? '✍️ Saisi' : '🔄 Réouverture' }}
                </span>
              </td>
              <td>{{ formatMoney(detail.montantTotal) }}</td>
              <td>
                <strong>{{ formatMoney(detail.montantParItem) }}</strong>
                <small>(1/{{ detail.nbItems }})</small>
              </td>
              <td>{{ formatDate(detail.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCostsByTypeStore } from '@/stores/FrontOffice/costsByTypeStore'

const store = useCostsByTypeStore()

const viewMode = ref('aggregated')  // 'aggregated' ou 'detailed'
const search = ref('')
const filterType = ref('all')

onMounted(() => {
  store.loadAll()
})

const sortedTypes = computed(() => {
  return [...store.costsByType].sort((a, b) => b.total - a.total)
})

const filteredDetails = computed(() => {
  let list = [...store.detailedCosts]

  if (filterType.value !== 'all') {
    list = list.filter(d => d.type === filterType.value)
  }

  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(d =>
      String(d.ticketId).includes(s) ||
      d.itemName?.toLowerCase().includes(s) ||
      d.itemtype?.toLowerCase().includes(s)
    )
  }

  return list
})

function formatMoney(value) {
  const n = parseFloat(value) || 0
  return `${n.toFixed(3)} €`
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
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
    'NetworkEquipment': 'Réseau',
    'Peripheral'      : 'Périphériques',
    'Software'        : 'Logiciels',
  }
  return labels[itemtype] || itemtype
}
</script>

<style scoped>
.costs-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

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

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions button {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.header-actions button.active {
  background: #fff;
  color: #10b981;
}
.btn-refresh {
  background: #fff !important;
  color: #10b981 !important;
}

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

.section-title {
  font-size: 16px;
  margin: 20px 0 12px 0;
  color: #1a1a2e;
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
.kpi-card.highlight   { background: #d1fae5; }
.kpi-card.kpi-saisi   { border-left-color: #3b82f6; }
.kpi-card.kpi-reouv   { border-left-color: #9333ea; }

.kpi-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
.kpi-value {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
}

/* FILTRES */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}
.search-input:focus { border-color: #10b981; }

.filters select {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
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

.costs-table tbody tr:hover { background: #f0fdf4; }

.costs-table td small {
  display: block;
  color: #9ca3af;
  font-size: 11px;
  margin-top: 2px;
}

/* COULEURS PAR TYPE */
.cout-saisi { color: #3b82f6; font-weight: 600; }
.cout-reouv { color: #9333ea; font-weight: 600; }

/* TYPE BADGES */
.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}
.badge-saisi {
  background: #dbeafe;
  color: #1e40af;
}
.badge-reouverture {
  background: #f3e8ff;
  color: #6b21a8;
}

/* COULEURS DE LIGNE */
.row-saisi { border-left: 4px solid #3b82f6; }
.row-reouv { border-left: 4px solid #9333ea; }

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>