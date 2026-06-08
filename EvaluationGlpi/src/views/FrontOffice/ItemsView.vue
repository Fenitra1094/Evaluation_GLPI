<template>
  <div class="items-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-icon">📦</div>
        <div>
          <h1>Éléments</h1>
          <p>{{ store.filteredItems.length }} élément(s) affiché(s) — {{ store.items.length }} au total</p>
        </div>
      </div>
      <button class="btn-refresh" @click="store.loadItems()" :disabled="store.loading">
        🔄 Actualiser
      </button>
    </header>

    <!-- ===== LOADING ===== -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>{{ store.loadingLabel }}</p>
    </div>

    <template v-else>

      <!-- ===== STATS RAPIDES ===== -->
      <div class="type-stats">
        <div
          class="type-pill"
          :class="{ active: store.filterType === 'all' }"
          @click="setTypeFilter('all')"
        >
          <span>🌐</span>
          <span>Tous</span>
          <span class="count">{{ store.items.length }}</span>
        </div>
        <div
          v-for="type in ITEM_TYPES"
          :key="type.key"
          class="type-pill"
          :class="[`color-${type.color}`, { active: store.filterType === type.key, empty: store.statsByType[type.key] === 0 }]"
          @click="setTypeFilter(type.key)"
        >
          <span>{{ type.icon }}</span>
          <span>{{ type.label }}</span>
          <span class="count">{{ store.statsByType[type.key] || 0 }}</span>
        </div>
      </div>

      <!-- ===== FILTRES AVANCÉS ===== -->
      <div class="filters-card">
        <div class="filters-header">
          <h3>🔍 Recherche multi-critères</h3>
          <button class="btn-toggle" @click="showFilters = !showFilters">
            {{ showFilters ? '▲ Réduire' : '▼ Filtres avancés' }}
          </button>
        </div>

        <!-- Recherche principale -->
        <div class="main-search">
          <span class="search-icon">🔍</span>
          <input
            v-model="store.search"
            type="text"
            placeholder="Rechercher par nom, numéro de série, ID..."
            @input="store.currentPage = 1"
          />
          <button v-if="hasActiveFilters" class="btn-clear" @click="store.resetFilters()">
            ✕ Tout effacer
          </button>
        </div>

        <!-- Filtres avancés (collapsible) -->
        <transition name="slide">
          <div v-if="showFilters" class="advanced-filters">

            <div class="filter-item">
              <label>📌 Statut</label>
              <select v-model="store.filterStatus" @change="store.currentPage = 1">
                <option v-for="s in store.uniqueStatuses" :key="s" :value="s">
                  {{ s === 'all' ? 'Tous les statuts' : s }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>📍 Emplacement</label>
              <select v-model="store.filterLocation" @change="store.currentPage = 1">
                <option v-for="l in store.uniqueLocations" :key="l" :value="l">
                  {{ l === 'all' ? 'Tous les emplacements' : l }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>🏭 Fabricant</label>
              <select v-model="store.filterManufacturer" @change="store.currentPage = 1">
                <option v-for="m in store.uniqueManufacturers" :key="m" :value="m">
                  {{ m === 'all' ? 'Tous les fabricants' : m }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>👤 Utilisateur</label>
              <select v-model="store.filterUser" @change="store.currentPage = 1">
                <option v-for="u in store.uniqueUsers" :key="u" :value="u">
                  {{ u === 'all' ? 'Tous les utilisateurs' : u }}
                </option>
              </select>
            </div>

          </div>
        </transition>

        <!-- Tags des filtres actifs -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-tag" v-if="store.search">
            🔍 "{{ store.search }}"
            <button @click="store.search = ''">✕</button>
          </span>
          <span class="filter-tag" v-if="store.filterType !== 'all'">
            Type : {{ getTypeLabel(store.filterType) }}
            <button @click="store.filterType = 'all'">✕</button>
          </span>
          <span class="filter-tag" v-if="store.filterStatus !== 'all'">
            Statut : {{ store.filterStatus }}
            <button @click="store.filterStatus = 'all'">✕</button>
          </span>
          <span class="filter-tag" v-if="store.filterLocation !== 'all'">
            Lieu : {{ store.filterLocation }}
            <button @click="store.filterLocation = 'all'">✕</button>
          </span>
          <span class="filter-tag" v-if="store.filterManufacturer !== 'all'">
            Marque : {{ store.filterManufacturer }}
            <button @click="store.filterManufacturer = 'all'">✕</button>
          </span>
          <span class="filter-tag" v-if="store.filterUser !== 'all'">
            User : {{ store.filterUser }}
            <button @click="store.filterUser = 'all'">✕</button>
          </span>
        </div>
      </div>

      <!-- ===== TABLEAU ===== -->
      <div v-if="store.filteredItems.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Aucun élément trouvé</h3>
        <p>Essayez de modifier vos filtres ou de réinitialiser</p>
        <button v-if="hasActiveFilters" class="btn-primary" @click="store.resetFilters()">
          🔄 Réinitialiser les filtres
        </button>
      </div>

      <div v-else class="items-list">
        <div class="list-header">
          <span class="col-type">Type</span>
          <span class="col-name sortable" @click="store.setSorting('name')">
            Nom {{ sortArrow('name') }}
          </span>
          <span class="col-serial sortable" @click="store.setSorting('serial')">
            N° série {{ sortArrow('serial') }}
          </span>
          <span class="col-status sortable" @click="store.setSorting('status')">
            Statut {{ sortArrow('status') }}
          </span>
          <span class="col-location sortable" @click="store.setSorting('location')">
            Lieu {{ sortArrow('location') }}
          </span>
          <span class="col-user sortable" @click="store.setSorting('user')">
            Utilisateur {{ sortArrow('user') }}
          </span>
        </div>

        <div
          v-for="item in store.paginatedItems"
          :key="`${item._itemtype}-${item.id}`"
          class="item-row"
          @click="store.selectItem(item)"
        >
          <span class="col-type">
            <span class="type-badge" :class="`color-${item._typeColor}`">
              {{ item._typeIcon }} {{ item._typeLabel }}
            </span>
          </span>
          <span class="col-name">
            <strong>{{ item.name || '—' }}</strong>
          </span>
          <span class="col-serial">{{ item.serial || item.otherserial || '—' }}</span>
          <span class="col-status">
            <span v-if="item.states_id?.name" class="pill">
              {{ item.states_id.name }}
            </span>
            <span v-else>—</span>
          </span>
          <span class="col-location">{{ item.locations_id?.name || '—' }}</span>
          <span class="col-user">{{ item.users_id?.name || '—' }}</span>
        </div>
      </div>

      <!-- ===== PAGINATION ===== -->
      <div v-if="store.totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="store.currentPage === 1"
          @click="store.goToPage(1)"
        >
          « Premier
        </button>
        <button
          class="page-btn"
          :disabled="store.currentPage === 1"
          @click="store.goToPage(store.currentPage - 1)"
        >
          ‹ Préc.
        </button>

        <span class="page-info">
          Page {{ store.currentPage }} / {{ store.totalPages }}
        </span>

        <button
          class="page-btn"
          :disabled="store.currentPage === store.totalPages"
          @click="store.goToPage(store.currentPage + 1)"
        >
          Suiv. ›
        </button>
        <button
          class="page-btn"
          :disabled="store.currentPage === store.totalPages"
          @click="store.goToPage(store.totalPages)"
        >
          Dernier »
        </button>

        <select v-model="store.perPage" class="per-page">
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
        </select>
      </div>

    </template>

    <!-- ===== MODAL DÉTAIL ===== -->
    <transition name="slide-modal">
      <div v-if="store.selectedItem" class="modal-overlay" @click.self="store.closeItem()">
        <div class="modal-content">

          <!-- HEADER -->
          <div class="modal-header" :class="`bg-${store.selectedItem._typeColor}`">
            <div class="modal-title">
              <span class="modal-icon">{{ store.selectedItem._typeIcon }}</span>
              <div>
                <span class="modal-type">{{ store.selectedItem._typeLabel }}</span>
                <h2>{{ store.selectedItem.name }}</h2>
              </div>
            </div>
            <button class="btn-close" @click="store.closeItem()">✕</button>
          </div>

          <!-- BODY -->
          <div class="modal-body">

            <!-- INFOS PRINCIPALES -->
            <div class="detail-grid">
              <div class="detail-card">
                <div class="detail-label">🆔 ID</div>
                <div class="detail-value">#{{ store.selectedItem.id }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">🔢 N° de série</div>
                <div class="detail-value">{{ store.selectedItem.serial || '—' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">🏷️ N° d'inventaire</div>
                <div class="detail-value">{{ store.selectedItem.otherserial || '—' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">📌 Statut</div>
                <div class="detail-value">
                  <span class="pill">{{ store.selectedItem.states_id?.name || '—' }}</span>
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-label">📍 Emplacement</div>
                <div class="detail-value">{{ store.selectedItem.locations_id?.name || '—' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">🏭 Fabricant</div>
                <div class="detail-value">{{ store.selectedItem.manufacturers_id?.name || '—' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">📦 Modèle</div>
                <div class="detail-value">{{ getModelName(store.selectedItem) || '—' }}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">👤 Utilisateur</div>
                <div class="detail-value">{{ store.selectedItem.users_id?.name || '—' }}</div>
              </div>
            </div>

            <!-- COMMENTAIRE -->
            <div v-if="store.selectedItem.comment" class="detail-section">
              <h3>📝 Commentaire</h3>
              <div class="comment-box">{{ store.selectedItem.comment }}</div>
            </div>

            <!-- DATES -->
            <div class="detail-section">
              <h3>📅 Informations temporelles</h3>
              <div class="detail-grid">
                <div class="detail-card">
                  <div class="detail-label">Date création</div>
                  <div class="detail-value">{{ formatDate(store.selectedItem.date_creation) }}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Dernière modif.</div>
                  <div class="detail-value">{{ formatDate(store.selectedItem.date_mod) }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useItemsStore } from '@/stores/FrontOffice/itemsStore'
import { ITEM_TYPES } from '@/api/glpi/FrontOffice/items'

const store = useItemsStore()
const showFilters = ref(false)

onMounted(() => {
  store.loadItems()
})

const hasActiveFilters = computed(() => {
  return store.search ||
         store.filterType !== 'all' ||
         store.filterStatus !== 'all' ||
         store.filterLocation !== 'all' ||
         store.filterManufacturer !== 'all' ||
         store.filterUser !== 'all'
})

function setTypeFilter(type) {
  store.filterType = type
  store.currentPage = 1
}

function getTypeLabel(typeKey) {
  const type = ITEM_TYPES.find(t => t.key === typeKey)
  return type ? type.label : typeKey
}

function sortArrow(field) {
  if (store.sortBy !== field) return '↕'
  return store.sortOrder === 'asc' ? '▲' : '▼'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getModelName(item) {
  // Le nom du modèle dépend du type d'item
  const typeLower = item._itemtype.toLowerCase()
  const field = `${typeLower}models_id`
  return item[field]?.name || null
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════ */
.items-view {
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
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  border-radius: 20px;
  padding: 25px 35px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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
   TYPE STATS
═══════════════════════════════════════════════ */
.type-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.type-pill {
  background: #fff;
  padding: 8px 14px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 2px solid transparent;
  font-size: 13px;
  font-weight: 600;
}

.type-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.type-pill.empty {
  opacity: 0.4;
}

.type-pill.active {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
}

.type-pill .count {
  background: #f3f4f6;
  color: #1a1a2e;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}

.type-pill.active .count {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

/* ═══════════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════════ */
.filters-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filters-header h3 {
  margin: 0;
  font-size: 15px;
  color: #1a1a2e;
}

.btn-toggle {
  background: #f3f4f6;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #475569;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.main-search {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
}

.main-search .search-icon {
  position: absolute;
  left: 14px;
  opacity: 0.5;
}

.main-search input {
  flex: 1;
  padding: 12px 14px 12px 38px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
}

.main-search input:focus {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30,58,138,0.1);
}

.btn-clear {
  background: #fee;
  color: #c00;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.advanced-filters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
}

.filter-item label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.filter-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
}

.filter-tag {
  background: #1e3a8a;
  color: #fff;
  padding: 5px 8px 5px 12px;
  border-radius: 100px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tag button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
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
  border-top-color: #1e3a8a;
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

.empty-state h3 { margin: 0 0 8px 0; color: #1a1a2e; }
.empty-state p { color: #6b7280; margin: 0 0 20px 0; }

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* ═══════════════════════════════════════════════
   LISTE
═══════════════════════════════════════════════ */
.items-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.list-header, .item-row {
  display: grid;
  grid-template-columns: 150px 1fr 130px 130px 150px 150px;
  gap: 12px;
  padding: 12px 18px;
  align-items: center;
}

.list-header {
  background: #f9fafb;
  font-weight: 700;
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: #1a1a2e;
}

.item-row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.item-row:hover {
  background: #f9fafb;
}

.col-name strong {
  color: #1a1a2e;
}

/* ═══════════════════════════════════════════════
   BADGES
═══════════════════════════════════════════════ */
.type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
}

.type-badge.color-purple { background: #ede9fe; color: #5b21b6; }
.type-badge.color-blue   { background: #dbeafe; color: #1e40af; }
.type-badge.color-orange { background: #ffedd5; color: #9a3412; }
.type-badge.color-green  { background: #d1fae5; color: #065f46; }
.type-badge.color-cyan   { background: #cffafe; color: #155e75; }
.type-badge.color-pink   { background: #fce7f3; color: #9d174d; }
.type-badge.color-gray   { background: #f3f4f6; color: #1f2937; }
.type-badge.color-yellow { background: #fef3c7; color: #854d0e; }
.type-badge.color-indigo { background: #e0e7ff; color: #3730a3; }
.type-badge.color-red    { background: #fee2e2; color: #991b1b; }
.type-badge.color-lime   { background: #ecfccb; color: #3f6212; }
.type-badge.color-teal   { background: #ccfbf1; color: #115e59; }
.type-badge.color-rose   { background: #ffe4e6; color: #9f1239; }

.type-pill.color-purple { border-color: #a78bfa; }
.type-pill.color-blue   { border-color: #60a5fa; }
.type-pill.color-orange { border-color: #fb923c; }
.type-pill.color-green  { border-color: #34d399; }
.type-pill.color-cyan   { border-color: #22d3ee; }
.type-pill.color-pink   { border-color: #f472b6; }
.type-pill.color-gray   { border-color: #9ca3af; }
.type-pill.color-yellow { border-color: #fcd34d; }
.type-pill.color-indigo { border-color: #818cf8; }
.type-pill.color-red    { border-color: #f87171; }
.type-pill.color-lime   { border-color: #a3e635; }
.type-pill.color-teal   { border-color: #2dd4bf; }
.type-pill.color-rose   { border-color: #fb7185; }

.pill {
  display: inline-block;
  padding: 3px 10px;
  background: #f3f4f6;
  color: #1a1a2e;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.page-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  padding: 0 15px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.per-page {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 25px 30px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-purple { background: linear-gradient(135deg, #a78bfa, #7c3aed); }
.bg-blue   { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.bg-orange { background: linear-gradient(135deg, #fb923c, #ea580c); }
.bg-green  { background: linear-gradient(135deg, #34d399, #059669); }
.bg-cyan   { background: linear-gradient(135deg, #22d3ee, #0891b2); }
.bg-pink   { background: linear-gradient(135deg, #f472b6, #db2777); }
.bg-gray   { background: linear-gradient(135deg, #9ca3af, #4b5563); }
.bg-yellow { background: linear-gradient(135deg, #fcd34d, #ca8a04); }
.bg-indigo { background: linear-gradient(135deg, #818cf8, #4f46e5); }
.bg-red    { background: linear-gradient(135deg, #f87171, #dc2626); }
.bg-lime   { background: linear-gradient(135deg, #a3e635, #65a30d); }
.bg-teal   { background: linear-gradient(135deg, #2dd4bf, #0d9488); }
.bg-rose   { background: linear-gradient(135deg, #fb7185, #e11d48); }

.modal-title {
  display: flex;
  gap: 15px;
  align-items: center;
}

.modal-icon {
  font-size: 40px;
}

.modal-type {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 3px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 5px;
}

.modal-title h2 {
  margin: 0;
  font-size: 22px;
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
}

.modal-body {
  padding: 25px 30px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.detail-card {
  background: #f9fafb;
  padding: 14px;
  border-radius: 10px;
  border-left: 3px solid #1e3a8a;
}

.detail-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 600;
}

.detail-section {
  margin-top: 25px;
}

.detail-section h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1a1a2e;
}

.comment-box {
  background: #f9fafb;
  padding: 15px;
  border-radius: 10px;
  font-size: 13px;
  color: #1a1a2e;
  white-space: pre-wrap;
  line-height: 1.6;
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  opacity: 0;
  max-height: 0;
}
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

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
  .advanced-filters {
    grid-template-columns: 1fr;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .list-header, .item-row {
    grid-template-columns: 1fr 1fr;
  }
  .col-serial, .col-status, .col-location, .col-user {
    display: none;
  }
}
</style>