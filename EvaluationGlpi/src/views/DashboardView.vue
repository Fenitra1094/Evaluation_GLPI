<template>
  <div class="dashboard">

    <!-- ===== HEADER ===== -->
    <header class="dash-header">
      <div class="dash-title">
        <div class="dash-icon">📊</div>
        <div>
          <h1>Dashboard GLPI</h1>
          <p v-if="store.lastUpdate">
            Dernière mise à jour : {{ formatDate(store.lastUpdate) }}
          </p>
          <p v-else>Vue d'ensemble de votre parc informatique</p>
        </div>
      </div>
      <button
        class="btn-refresh"
        @click="store.loadDashboard()"
        :disabled="store.loading"
      >
        <span v-if="store.loading">⏳ Chargement...</span>
        <span v-else>🔄 Actualiser</span>
      </button>
    </header>

    <!-- ===== LOADING ===== -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>{{ store.loadingLabel || 'Chargement...' }}</p>
    </div>

    <!-- ===== CONTENU ===== -->
    <div v-else-if="store.lastUpdate" class="dash-content">

      <!-- KPI PRINCIPAUX -->
      <section class="kpi-grid">
        <div class="kpi-card kpi-assets">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ store.totalAssets }}</div>
            <div class="kpi-label">Éléments au total</div>
            <div class="kpi-sub">{{ store.assetsWithItems.length }} types présents</div>
          </div>
        </div>

        <div class="kpi-card kpi-tickets">
          <div class="kpi-icon">🎫</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ store.tickets.total }}</div>
            <div class="kpi-label">Tickets au total</div>
            <div class="kpi-sub">{{ openTickets }} ouverts • {{ closedTickets }} fermés</div>
          </div>
        </div>

        <div class="kpi-card kpi-incidents">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ incidentCount }}</div>
            <div class="kpi-label">Incidents</div>
            <div class="kpi-sub">{{ requestCount }} demandes</div>
          </div>
        </div>

        <div class="kpi-card kpi-urgent">
          <div class="kpi-icon">🔥</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ urgentTickets }}</div>
            <div class="kpi-label">Tickets prioritaires</div>
            <div class="kpi-sub">Haute & majeure</div>
          </div>
        </div>
      </section>

      <!-- ASSETS PAR TYPE -->
      <section class="dash-section">
        <div class="section-head">
          <h2>📦 Éléments par type</h2>
          <span class="badge">{{ store.assetsWithItems.length }} catégories</span>
        </div>

        <div class="assets-grid">
          <div
            v-for="asset in store.assetsWithItems"
            :key="asset.key"
            class="asset-card"
            :class="[`color-${asset.color}`, { empty: asset.count === 0 }]"
          >
            <div class="asset-icon">{{ asset.icon }}</div>
            <div class="asset-info">
              <div class="asset-count">{{ asset.count }}</div>
              <div class="asset-label">{{ asset.label }}</div>
            </div>
            <div v-if="asset.count > 0 && store.totalAssets > 0" class="asset-bar">
              <div
                class="asset-bar-fill"
                :style="{ width: getPercent(asset.count, store.totalAssets) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- TICKETS DÉTAILS -->
      <section v-if="store.tickets.total > 0" class="tickets-section">

        <!-- TICKETS PAR STATUT -->
        <div class="dash-section">
          <div class="section-head">
            <h2>🎫 Tickets par statut</h2>
          </div>

          <div class="stats-grid">
            <div
              v-for="(s, i) in store.tickets.byStatus"
              :key="i"
              class="stat-tile"
              :class="`tile-${s.color}`"
            >
              <div class="stat-icon">{{ s.icon }}</div>
              <div class="stat-data">
                <div class="stat-num">{{ s.count }}</div>
                <div class="stat-name">{{ s.label }}</div>
              </div>
              <div class="stat-percent">
                {{ getPercent(s.count, store.tickets.total) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- TICKETS PAR TYPE -->
        <div class="dash-section">
          <div class="section-head">
            <h2>📩 Tickets par type</h2>
          </div>

          <div class="type-cards">
            <div
              v-for="(t, i) in store.tickets.byType"
              :key="i"
              class="type-card"
              :class="`type-${t.color}`"
            >
              <div class="type-header">
                <span class="type-icon">{{ t.icon }}</span>
                <span class="type-label">{{ t.label }}</span>
              </div>
              <div class="type-value">{{ t.count }}</div>
              <div class="type-bar">
                <div
                  class="type-bar-fill"
                  :style="{ width: getPercent(t.count, store.tickets.total) + '%' }"
                ></div>
              </div>
              <div class="type-percent">
                {{ getPercent(t.count, store.tickets.total) }}% des tickets
              </div>
            </div>
          </div>
        </div>

        <!-- TICKETS PAR PRIORITÉ -->
        <div class="dash-section">
          <div class="section-head">
            <h2>🎯 Tickets par priorité</h2>
          </div>

          <div class="priority-list">
            <div
              v-for="(p, i) in store.tickets.byPriority"
              :key="i"
              class="priority-row"
              :class="`prio-${p.color}`"
            >
              <span class="priority-label">{{ p.label }}</span>
              <div class="priority-bar">
                <div
                  class="priority-bar-fill"
                  :style="{ width: getPercent(p.count, store.tickets.total) + '%' }"
                ></div>
              </div>
              <span class="priority-count">{{ p.count }}</span>
            </div>
          </div>
        </div>

      </section>

      <!-- TOP 5 ASSETS -->
      <section class="dash-section">
        <div class="section-head">
          <h2>🏆 Top 5 des catégories</h2>
        </div>

        <div class="top-list">
          <div
            v-for="(asset, i) in store.topAssets"
            :key="i"
            class="top-row"
          >
            <div class="top-rank">#{{ i + 1 }}</div>
            <div class="top-icon">{{ asset.icon }}</div>
            <div class="top-name">{{ asset.label }}</div>
            <div class="top-bar">
              <div
                class="top-bar-fill"
                :class="`color-${asset.color}`"
                :style="{ width: getPercent(asset.count, store.totalAssets) + '%' }"
              ></div>
            </div>
            <div class="top-count">{{ asset.count }}</div>
          </div>
        </div>
      </section>

    </div>

    <!-- ===== EMPTY STATE ===== -->
    <div v-else class="empty-state">
      <div class="empty-icon">📊</div>
      <h2>Aucune donnée chargée</h2>
      <p>Clique sur "Charger le dashboard" pour commencer</p>
      <button class="btn-primary" @click="store.loadDashboard()">
        🚀 Charger le dashboard
      </button>
    </div>

    <!-- ===== ERREUR ===== -->
    <div v-if="store.error" class="error-alert">
      <strong>❌ Erreur :</strong> {{ store.error }}
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()

onMounted(() => {
  store.loadDashboard()
})

function getPercent(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const openTickets = computed(() => {
  if (!store.tickets.raw) return 0
  return store.tickets.raw.filter(t => [1, 2, 3, 4].includes(t.status)).length
})

const closedTickets = computed(() => {
  if (!store.tickets.raw) return 0
  return store.tickets.raw.filter(t => [5, 6].includes(t.status)).length
})

const incidentCount = computed(() => {
  const t = store.tickets.byType.find(t => t.label === 'Incident')
  return t ? t.count : 0
})

const requestCount = computed(() => {
  const t = store.tickets.byType.find(t => t.label === 'Demande')
  return t ? t.count : 0
})

const urgentTickets = computed(() => {
  if (!store.tickets.raw) return 0
  return store.tickets.raw.filter(t => [4, 5, 6].includes(t.priority)).length
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════ */
.dashboard {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════ */
.dash-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 20px;
  padding: 30px 35px;
  margin-bottom: 25px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(30, 41, 59, 0.3);
}

.dash-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dash-icon {
  font-size: 50px;
  background: rgba(255,255,255,0.1);
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.dash-header h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 700;
}

.dash-header p {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.btn-refresh {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255,255,255,0.25);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════
   LOADING
═══════════════════════════════════════════════ */
.loading-card {
  background: #fff;
  padding: 80px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ═══════════════════════════════════════════════
   KPI GRID
═══════════════════════════════════════════════ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 25px;
}

.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  gap: 18px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
}

.kpi-assets::before    { background: linear-gradient(180deg, #667eea, #764ba2); }
.kpi-tickets::before   { background: linear-gradient(180deg, #3b82f6, #2563eb); }
.kpi-incidents::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
.kpi-urgent::before    { background: linear-gradient(180deg, #ef4444, #dc2626); }

.kpi-icon {
  font-size: 42px;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 3px;
}

.kpi-sub {
  font-size: 11px;
  color: #9ca3af;
}

/* ═══════════════════════════════════════════════
   SECTIONS
═══════════════════════════════════════════════ */
.dash-section {
  background: #fff;
  border-radius: 16px;
  padding: 25px 30px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-head h2 {
  margin: 0;
  font-size: 18px;
  color: #1a1a2e;
}

.badge {
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* ═══════════════════════════════════════════════
   ASSETS GRID
═══════════════════════════════════════════════ */
.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.asset-card {
  background: #fafbfc;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.asset-card.empty {
  opacity: 0.4;
}

.asset-card:hover {
  transform: translateY(-2px);
}

.asset-card.color-purple { border-color: #a78bfa; background: #faf5ff; }
.asset-card.color-blue   { border-color: #60a5fa; background: #eff6ff; }
.asset-card.color-orange { border-color: #fb923c; background: #fff7ed; }
.asset-card.color-green  { border-color: #34d399; background: #f0fdf4; }
.asset-card.color-cyan   { border-color: #22d3ee; background: #ecfeff; }
.asset-card.color-pink   { border-color: #f472b6; background: #fdf2f8; }
.asset-card.color-gray   { border-color: #9ca3af; background: #f9fafb; }
.asset-card.color-yellow { border-color: #fcd34d; background: #fffbeb; }
.asset-card.color-indigo { border-color: #818cf8; background: #eef2ff; }
.asset-card.color-red    { border-color: #f87171; background: #fef2f2; }
.asset-card.color-amber  { border-color: #fbbf24; background: #fffbeb; }
.asset-card.color-lime   { border-color: #a3e635; background: #f7fee7; }
.asset-card.color-teal   { border-color: #2dd4bf; background: #f0fdfa; }
.asset-card.color-rose   { border-color: #fb7185; background: #fff1f2; }
.asset-card.color-violet { border-color: #a78bfa; background: #faf5ff; }

.asset-card.empty { border-color: #e5e7eb; background: #f9fafb; }

.asset-icon {
  font-size: 36px;
}

.asset-info {
  text-align: center;
}

.asset-count {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a2e;
}

.asset-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.asset-bar {
  width: 100%;
  height: 4px;
  background: rgba(0,0,0,0.05);
  border-radius: 100px;
  overflow: hidden;
}

.asset-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 100px;
}

/* ═══════════════════════════════════════════════
   STATS TICKETS
═══════════════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-tile {
  background: #fafbfc;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid;
}

.tile-blue   { border-color: #3b82f6; }
.tile-orange { border-color: #f59e0b; }
.tile-purple { border-color: #8b5cf6; }
.tile-yellow { border-color: #eab308; }
.tile-green  { border-color: #10b981; }
.tile-gray   { border-color: #6b7280; }

.stat-icon {
  font-size: 24px;
}

.stat-data {
  flex: 1;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
}

.stat-name {
  font-size: 12px;
  color: #6b7280;
  margin-top: 3px;
}

.stat-percent {
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
}

/* ═══════════════════════════════════════════════
   TYPE CARDS
═══════════════════════════════════════════════ */
.type-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.type-card {
  background: linear-gradient(135deg, #fafbfc, #f3f4f6);
  border-radius: 14px;
  padding: 20px;
  border: 2px solid transparent;
}

.type-red  { border-color: #ef4444; }
.type-blue { border-color: #3b82f6; }

.type-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.type-icon {
  font-size: 24px;
}

.type-label {
  font-weight: 700;
  color: #1a1a2e;
}

.type-value {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
  margin-bottom: 10px;
}

.type-bar {
  height: 8px;
  background: rgba(0,0,0,0.05);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 8px;
}

.type-bar-fill {
  height: 100%;
  background: currentColor;
  border-radius: 100px;
  transition: width 0.5s ease;
}

.type-red  .type-bar-fill { background: #ef4444; }
.type-blue .type-bar-fill { background: #3b82f6; }

.type-percent {
  font-size: 11px;
  color: #6b7280;
}

/* ═══════════════════════════════════════════════
   PRIORITY LIST
═══════════════════════════════════════════════ */
.priority-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.priority-row {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  background: #fafbfc;
  border-radius: 10px;
}

.priority-label {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a2e;
}

.priority-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
}

.priority-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
}

.prio-gray   .priority-bar-fill { background: #6b7280; }
.prio-blue   .priority-bar-fill { background: #3b82f6; }
.prio-yellow .priority-bar-fill { background: #eab308; }
.prio-orange .priority-bar-fill { background: #f59e0b; }
.prio-red    .priority-bar-fill { background: #ef4444; }
.prio-purple .priority-bar-fill { background: #8b5cf6; }

.priority-count {
  font-weight: 800;
  font-size: 16px;
  color: #1a1a2e;
  text-align: right;
}

/* ═══════════════════════════════════════════════
   TOP LIST
═══════════════════════════════════════════════ */
.top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-row {
  display: grid;
  grid-template-columns: 40px 40px 150px 1fr 60px;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background: #fafbfc;
  border-radius: 10px;
}

.top-rank {
  font-weight: 800;
  color: #667eea;
  font-size: 16px;
}

.top-icon {
  font-size: 24px;
}

.top-name {
  font-weight: 600;
  color: #1a1a2e;
}

.top-bar {
  height: 10px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
}

.top-bar-fill {
  height: 100%;
  border-radius: 100px;
}

.top-bar-fill.color-purple { background: linear-gradient(90deg, #a78bfa, #7c3aed); }
.top-bar-fill.color-blue   { background: linear-gradient(90deg, #60a5fa, #2563eb); }
.top-bar-fill.color-orange { background: linear-gradient(90deg, #fb923c, #ea580c); }
.top-bar-fill.color-green  { background: linear-gradient(90deg, #34d399, #059669); }
.top-bar-fill.color-red    { background: linear-gradient(90deg, #f87171, #dc2626); }
.top-bar-fill.color-cyan   { background: linear-gradient(90deg, #22d3ee, #0891b2); }
.top-bar-fill.color-pink   { background: linear-gradient(90deg, #f472b6, #db2777); }
.top-bar-fill.color-gray   { background: linear-gradient(90deg, #9ca3af, #4b5563); }

.top-count {
  font-weight: 800;
  font-size: 16px;
  color: #1a1a2e;
  text-align: right;
}

/* ═══════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════ */
.empty-state {
  background: #fff;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.btn-primary {
  margin-top: 20px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
}

/* ═══════════════════════════════════════════════
   ERREUR
═══════════════════════════════════════════════ */
.error-alert {
  background: #fef2f2;
  color: #991b1b;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #dc2626;
  margin-top: 20px;
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 900px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .type-cards {
    grid-template-columns: 1fr;
  }
}
</style>