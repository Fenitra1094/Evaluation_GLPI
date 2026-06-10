<template>
  <div class="tickets-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-icon">🎫</div>
        <div>
          <h1>Tickets</h1>
          <p>{{ store.filteredTickets.length }} ticket(s) — {{ store.tickets.length }} au total</p>
        </div>
      </div>
      <button class="btn-refresh" @click="store.loadTickets()" :disabled="store.loading">
        🔄 Actualiser
      </button>
    </header>

    <!-- ===== STATS RAPIDES ===== -->
    <div class="quick-stats">
      <div
        v-for="(count, id) in store.totalByStatus"
        :key="id"
        class="stat-pill"
        :class="`color-${store.getStatusInfo(parseInt(id)).color}`"
        @click="store.filterStatus = String(id)"
      >
        <span class="stat-icon">{{ store.getStatusInfo(parseInt(id)).icon }}</span>
        <span class="stat-label">{{ store.getStatusInfo(parseInt(id)).label }}</span>
        <span class="stat-count">{{ count }}</span>
      </div>
    </div>

    <!-- ===== FILTRES ===== -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="store.search"
          type="text"
          placeholder="Rechercher par titre, description ou ID..."
        />
      </div>

      <select v-model="store.filterStatus">
        <option value="all">Tous les statuts</option>
        <option v-for="(s, id) in STATUS_LABELS" :key="id" :value="id">
          {{ s.icon }} {{ s.label }}
        </option>
      </select>

      <select v-model="store.filterType">
        <option value="all">Tous les types</option>
        <option v-for="(t, id) in TYPE_LABELS" :key="id" :value="id">
          {{ t.icon }} {{ t.label }}
        </option>
      </select>

      <button class="btn-clear" @click="resetFilters">
        ✕ Effacer
      </button>
    </div>

    <!-- ===== LOADING ===== -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>Chargement des tickets...</p>
    </div>

    <!-- ===== LISTE VIDE ===== -->
    <div v-else-if="store.filteredTickets.length === 0" class="empty-state">
      <div class="empty-icon">🎫</div>
      <h3>Aucun ticket trouvé</h3>
      <p v-if="store.search || store.filterStatus !== 'all' || store.filterType !== 'all'">
        Essayez de modifier vos filtres
      </p>
      <p v-else>Importez votre fichier CSV de tickets pour commencer</p>
    </div>

    <!-- ===== TABLEAU DES TICKETS ===== -->
    <div v-else class="tickets-list">
      <div class="list-header">
        <span class="col-id">#</span>
        <span class="col-type">Type</span>
        <span class="col-status">Statut</span>
        <span class="col-priority">Priorité</span>
        <span class="col-title">Titre</span>
        <span class="col-date">Date</span>
      </div>

      <div
        v-for="ticket in store.filteredTickets"
        :key="ticket.id"
        class="ticket-row"
        @click="store.selectTicket(ticket)"
      >
        <span class="col-id"># {{ ticket.id }}</span>

        <span class="col-type">
          <span class="pill" :class="`pill-${store.getTypeInfo(ticket.type).color}`">
            {{ store.getTypeInfo(ticket.type).icon }} {{ store.getTypeInfo(ticket.type).label }}
          </span>
        </span>

        <span class="col-status">
          <span class="pill" :class="`pill-${store.getStatusInfo(ticket.status).color}`">
            {{ store.getStatusInfo(ticket.status).label }}
          </span>
        </span>

        <span class="col-priority">
          <span class="pill" :class="`pill-${store.getPriorityInfo(ticket.priority).color}`">
            {{ store.getPriorityInfo(ticket.priority).label }}
          </span>
        </span>

        <span class="col-title">
          <strong>{{ ticket.name }}</strong>
          <small v-if="ticket.content">{{ truncate(ticket.content, 60) }}</small>
        </span>

        <span class="col-date">{{ formatDate(ticket.date) }}</span>
      </div>
    </div>

    <!-- ===== FICHE DÉTAILLÉE (MODAL) ===== -->
    <transition name="slide-modal">
      <div v-if="store.selectedTicket" class="modal-overlay" @click.self="store.closeTicket()">
        <div class="modal-content">

          <!-- HEADER -->
          <div class="modal-header" :class="`header-${store.getTypeInfo(store.selectedTicket.type).color}`">
            <div class="modal-title">
              <span class="ticket-type">
                {{ store.getTypeInfo(store.selectedTicket.type).icon }}
                {{ store.getTypeInfo(store.selectedTicket.type).label }}
              </span>
              <h2>#{{ store.selectedTicket.id }} — {{ store.selectedTicket.name }}</h2>
              <div class="modal-badges">
                <span class="badge" :class="`pill-${store.getStatusInfo(store.selectedTicket.status).color}`">
                  {{ store.getStatusInfo(store.selectedTicket.status).icon }}
                  {{ store.getStatusInfo(store.selectedTicket.status).label }}
                </span>
                <span class="badge" :class="`pill-${store.getPriorityInfo(store.selectedTicket.priority).color}`">
                  Priorité : {{ store.getPriorityInfo(store.selectedTicket.priority).label }}
                </span>
              </div>
            </div>
            <button class="btn-close" @click="store.closeTicket()">✕</button>
          </div>

          <!-- BODY -->
          <div class="modal-body">

            <!-- INFOS PRINCIPALES -->
            <section class="info-grid">
              <div class="info-card">
                <div class="info-label">📅 Date d'ouverture</div>
                <div class="info-value">{{ formatDateFull(store.selectedTicket.date) }}</div>
              </div>
              <div class="info-card">
                <div class="info-label">📅 Dernière mise à jour</div>
                <div class="info-value">{{ formatDateFull(store.selectedTicket.date_mod) }}</div>
              </div>
              <div class="info-card">
                <div class="info-label">🆔 ID interne</div>
                <div class="info-value">#{{ store.selectedTicket.id }}</div>
              </div>
              <div class="info-card">
                <div class="info-label">🏷️ Entité</div>
                <div class="info-value">
                  {{ store.selectedTicket.entities_id?.name || 'Entité racine' }}
                </div>
              </div>
            </section>

            <!-- DESCRIPTION -->
            <section class="content-section">
              <h3>📝 Description ichiiiii</h3>
              <div class="content-box" v-html="store.selectedTicket.content || '<em>Aucune description</em>'"></div>
            </section>

            <!-- LOADING DETAILS -->
            <div v-if="store.loadingDetails" class="loading-mini">
              <div class="spinner-small"></div>
              <span>Chargement des éléments liés...</span>
            </div>
            
            <!-- ÉLÉMENTS ASSOCIÉS -->
            <section v-else-if="store.ticketItems.length > 0" class="content-section">
              <h3>
                🔗 Éléments associés
                <span class="count-badge">{{ store.ticketItems.length }}</span>
              </h3>
              <div class="items-grid">
                <div
                  v-for="(item, i) in store.ticketItems"
                  :key="i"
                  class="item-card"
                >
                  <div class="item-icon">{{ getItemIcon(item.itemtype) }}</div>
                  <div class="item-info">
                    <strong>{{ item.details?.name || `${item.itemtype} #${item.items_id}` }}</strong>
                    <small>{{ item.itemtype }}</small>
                    <div v-if="item.details?.serial" class="item-meta">
                      🆔 {{ item.details.serial }}
                    </div>
                    <div v-if="item.details?.locations_id?.name" class="item-meta">
                      📍 {{ item.details.locations_id.name }}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- COÛTS -->
            <section v-if="store.ticketCosts.length > 0" class="content-section">
              <h3>
                💰 Coûts associés
                <span class="count-badge">{{ store.ticketCosts.length }}</span>
              </h3>
              <div class="costs-table">
                <div class="cost-header">
                  <span>Nom</span>
                  <span>Durée</span>
                  <span>Coût horaire</span>
                  <span>Coût fixe</span>
                  <span>Total</span>
                </div>
                <div v-for="(cost, i) in store.ticketCosts" :key="i" class="cost-row">
                  <span>{{ cost.name }}</span>
                  <span>{{ formatDuration(cost.actiontime) }}</span>
                  <span>{{ formatMoney(cost.cost_time) }}</span>
                  <span>{{ formatMoney(cost.cost_fixed) }}</span>
                  <span class="cost-total">{{ calculateCostTotal(cost) }}</span>
                </div>
                <div class="cost-grand-total">
                  <span>TOTAL</span>
                  <strong>{{ formatMoney(grandTotal) }}</strong>
                </div>
              </div>
            </section>

          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useTicketsStore } from '@/stores/ticketsStore'
import { STATUS_LABELS, TYPE_LABELS } from '@/api/glpi/tickets'

const store = useTicketsStore()

onMounted(() => {
  store.loadTickets()
})

function resetFilters() {
  store.search = ''
  store.filterStatus = 'all'
  store.filterType = 'all'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDateFull(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function truncate(text, len) {
  if (!text) return ''
  const clean = text.replace(/<[^>]+>/g, '')
  return clean.length > len ? clean.substring(0, len) + '...' : clean
}

function formatDuration(seconds) {
  if (!seconds) return '0s'
  const s = parseInt(seconds)
  if (s < 60) return `${s}s`
  const min = Math.floor(s / 60)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}min`
}

function formatMoney(value) {
  const n = parseFloat(value) || 0
  return `${n.toFixed(2)} €`
}

function calculateCostTotal(cost) {
  const time = parseFloat(cost.cost_time) || 0
  const fixed = parseFloat(cost.cost_fixed) || 0
  const material = parseFloat(cost.cost_material) || 0
  const seconds = parseInt(cost.actiontime) || 0
  const timeCost = (seconds / 3600) * time
  return formatMoney(timeCost + fixed + material)
}

const grandTotal = computed(() => {
  return store.ticketCosts.reduce((sum, cost) => {
    const time = parseFloat(cost.cost_time) || 0
    const fixed = parseFloat(cost.cost_fixed) || 0
    const material = parseFloat(cost.cost_material) || 0
    const seconds = parseInt(cost.actiontime) || 0
    const timeCost = (seconds / 3600) * time
    return sum + timeCost + fixed + material
  }, 0)
})

function getItemIcon(itemtype) {
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
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════ */
.tickets-view {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  border-radius: 20px;
  padding: 25px 35px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.header-icon {
  font-size: 40px;
  background: rgba(255,255,255,0.1);
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header h1 {
  margin: 0 0 4px 0;
  font-size: 26px;
}

.page-header p {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.btn-refresh {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255,255,255,0.25);
}

/* ═══════════════════════════════════════════════
   QUICK STATS
═══════════════════════════════════════════════ */
.quick-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-pill {
  background: #fff;
  padding: 10px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-left: 4px solid;
}

.stat-pill:hover {
  transform: translateY(-2px);
}

.stat-pill.color-blue   { border-color: #3b82f6; }
.stat-pill.color-orange { border-color: #f59e0b; }
.stat-pill.color-purple { border-color: #8b5cf6; }
.stat-pill.color-yellow { border-color: #eab308; }
.stat-pill.color-green  { border-color: #10b981; }
.stat-pill.color-gray   { border-color: #6b7280; }

.stat-icon { font-size: 14px; }
.stat-label { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.stat-count {
  background: #1a1a2e;
  color: #fff;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}

/* ═══════════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════════ */
.filters-bar {
  background: #fff;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}

.search-box input:focus {
  border-color: #667eea;
}

.filters-bar select {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.btn-clear {
  background: #fee;
  color: #c00;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════
   LOADING / EMPTY
═══════════════════════════════════════════════ */
.loading-card, .empty-state {
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

.empty-icon {
  font-size: 80px;
  opacity: 0.4;
  margin-bottom: 15px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #1a1a2e;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

/* ═══════════════════════════════════════════════
   LISTE TICKETS
═══════════════════════════════════════════════ */
.tickets-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.list-header, .ticket-row {
  display: grid;
  grid-template-columns: 80px 120px 130px 130px 1fr 130px;
  gap: 15px;
  padding: 14px 20px;
  align-items: center;
}

.list-header {
  background: #f9fafb;
  font-weight: 700;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.ticket-row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.ticket-row:hover {
  background: #f9fafb;
}

.col-id {
  font-weight: 700;
  color: #6b7280;
}

.col-title strong {
  color: #1a1a2e;
  display: block;
}

.col-title small {
  display: block;
  color: #6b7280;
  font-size: 11px;
  margin-top: 2px;
}

.col-date {
  color: #6b7280;
  font-size: 12px;
}

/* ═══════════════════════════════════════════════
   PILLS (badges)
═══════════════════════════════════════════════ */
.pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.pill-blue   { background: #dbeafe; color: #1e40af; }
.pill-orange { background: #ffedd5; color: #9a3412; }
.pill-purple { background: #ede9fe; color: #5b21b6; }
.pill-yellow { background: #fef3c7; color: #854d0e; }
.pill-green  { background: #d1fae5; color: #065f46; }
.pill-gray   { background: #f3f4f6; color: #1f2937; }
.pill-red    { background: #fee2e2; color: #991b1b; }

/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 25px 30px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
}

.header-red   { background: linear-gradient(135deg, #ef4444, #991b1b); }
.header-blue  { background: linear-gradient(135deg, #3b82f6, #1e40af); }
.header-gray  { background: linear-gradient(135deg, #6b7280, #1f2937); }

.modal-title {
  flex: 1;
}

.ticket-type {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.modal-title h2 {
  margin: 0 0 15px 0;
  font-size: 22px;
  line-height: 1.3;
}

.modal-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-badges .badge {
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
}

.btn-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(255,255,255,0.3);
}

.modal-body {
  padding: 25px 30px;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 25px;
}

.info-card {
  background: #f9fafb;
  padding: 14px;
  border-radius: 10px;
  border-left: 3px solid #667eea;
}

.info-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.info-value {
  font-size: 13px;
  color: #1a1a2e;
  font-weight: 600;
}

/* SECTIONS */
.content-section {
  margin-bottom: 25px;
}

.content-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  background: #667eea;
  color: #fff;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
}

.content-box {
  background: #f9fafb;
  padding: 18px;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1a2e;
  line-height: 1.6;
}

/* ITEMS GRID */
.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.item-card {
  background: #f9fafb;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  align-items: start;
  border-left: 3px solid #667eea;
}

.item-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info strong {
  display: block;
  color: #1a1a2e;
  margin-bottom: 3px;
}

.item-info small {
  color: #6b7280;
  font-size: 11px;
}

.item-meta {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

/* COSTS */
.costs-table {
  background: #f9fafb;
  border-radius: 10px;
  overflow: hidden;
}

.cost-header, .cost-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 10px 15px;
  font-size: 13px;
}

.cost-header {
  background: #f3f4f6;
  font-weight: 700;
  color: #6b7280;
  font-size: 11px;
  text-transform: uppercase;
}

.cost-row {
  border-bottom: 1px solid #f3f4f6;
}

.cost-total {
  font-weight: 700;
  color: #1a1a2e;
}

.cost-grand-total {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 15px;
}

.loading-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #6b7280;
  font-size: 13px;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
.slide-modal-enter-active,
.slide-modal-leave-active {
  transition: all 0.3s ease;
}
.slide-modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.slide-modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 900px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .items-grid {
    grid-template-columns: 1fr;
  }
  .list-header, .ticket-row {
    grid-template-columns: 60px 1fr 1fr;
    font-size: 12px;
  }
  .col-type, .col-priority, .col-date {
    display: none;
  }
}
</style>