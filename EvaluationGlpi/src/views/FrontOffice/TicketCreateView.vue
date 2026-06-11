<template>
  <div class="create-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <button class="btn-back" @click="goBack">← Retour</button>
      <div>
        <h1>🎫 Nouveau Ticket</h1>
        <p>Créer un ticket avec éléments et coûts associés</p>
      </div>
    </header>

    <!-- ===== MESSAGES ===== -->
    <div v-if="store.successMsg" class="msg msg-success">
      ✅ {{ store.successMsg }}
    </div>
    <div v-if="store.error" class="msg msg-error">
      ❌ {{ store.error }}
    </div>

    <!-- ===== FORMULAIRE ===== -->
    <form @submit.prevent="onSubmit" class="form-grid">

      <!-- ===== SECTION 1 : INFOS GÉNÉRALES ===== -->
      <section class="form-card">
        <h2>📝 Informations générales</h2>

        <div class="field">
          <label>Titre <span class="req">*</span></label>
          <input
            v-model="store.form.name"
            type="text"
            placeholder="Ex: Imprimante en panne"
            required
          />
        </div>

        <div class="field">
          <label>Description <span class="req">*</span></label>
          <textarea
            v-model="store.form.content"
            rows="5"
            placeholder="Décrivez le problème ou la demande..."
            required
          ></textarea>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Type</label>
            <select v-model.number="store.form.type">
              <option :value="1">⚠️ Incident</option>
              <option :value="2">📩 Demande</option>
            </select>
          </div>

          <div class="field">
            <label>Statut</label>
            <select v-model.number="store.form.status">
              <option :value="1">🔵 New</option>
              <option :value="2">🟠 In progress</option>
              <option :value="6">⚫ Closed</option>
            </select>
          </div>

          <div class="field">
            <label>Date d'ouverture</label>
            <input
              v-model="store.form.date"
              type="datetime-local"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Urgence</label>
            <select v-model.number="store.form.urgency">
              <option :value="1">1 - Très basse</option>
              <option :value="2">2 - Basse</option>
              <option :value="3">3 - Moyenne</option>
              <option :value="4">4 - Haute</option>
              <option :value="5">5 - Très haute</option>
            </select>
          </div>

          <div class="field">
            <label>Impact</label>
            <select v-model.number="store.form.impact">
              <option :value="1">1 - Très bas</option>
              <option :value="2">2 - Bas</option>
              <option :value="3">3 - Moyen</option>
              <option :value="4">4 - Haut</option>
              <option :value="5">5 - Très haut</option>
            </select>
          </div>

          <div class="field">
            <label>Priorité</label>
            <select v-model.number="store.form.priority">
              <option :value="1">1 - Très basse</option>
              <option :value="2">2 - Basse</option>
              <option :value="3">3 - Moyenne</option>
              <option :value="4">4 - Haute</option>
              <option :value="5">5 - Très haute</option>
              <option :value="6">6 - Majeure</option>
            </select>
          </div>
        </div>
      </section>
      <!-- ===== SECTION : ACTEURS (comme GLPI) ===== -->
<section class="form-card">
  <h2>
    👥 Acteurs
    <span class="badge">{{ store.totalActors }}</span>
  </h2>

  <!-- DEMANDEURS -->
  <div class="actor-group">
    <div class="actor-header">
      <label>
        <span class="actor-icon">👤</span>
        Demandeur(s)
      </label>
      <button
        type="button"
        class="btn-add-mini"
        @click="openActorSelector(1)"
      >
        + Ajouter
      </button>
    </div>

    <div v-if="store.actors.requesters.length === 0" class="empty-mini">
      Aucun demandeur
    </div>

    <div v-else class="actor-chips">
      <div
        v-for="user in store.actors.requesters"
        :key="user.id"
        class="actor-chip chip-requester"
      >
        <span>👤 {{ formatUserName(user) }}</span>
        <button
          type="button"
          class="chip-remove"
          @click="store.removeActor(user.id, 1)"
        >✕</button>
      </div>
    </div>
  </div>

  <!-- TECHNICIENS ASSIGNÉS -->
  <div class="actor-group">
    <div class="actor-header">
      <label>
        <span class="actor-icon">🔧</span>
        Technicien(s) assigné(s)
      </label>
      <button
        type="button"
        class="btn-add-mini"
        @click="openActorSelector(2)"
      >
        + Ajouter
      </button>
    </div>

    <div v-if="store.actors.assignees.length === 0" class="empty-mini">
      Aucun technicien
    </div>

    <div v-else class="actor-chips">
      <div
        v-for="user in store.actors.assignees"
        :key="user.id"
        class="actor-chip chip-assignee"
      >
        <span>🔧 {{ formatUserName(user) }}</span>
        <button
          type="button"
          class="chip-remove"
          @click="store.removeActor(user.id, 2)"
        >✕</button>
      </div>
    </div>
  </div>

  <!-- OBSERVATEURS -->
  <div class="actor-group">
    <div class="actor-header">
      <label>
        <span class="actor-icon">👁️</span>
        Observateur(s)
      </label>
      <button
        type="button"
        class="btn-add-mini"
        @click="openActorSelector(3)"
      >
        + Ajouter
      </button>
    </div>

    <div v-if="store.actors.watchers.length === 0" class="empty-mini">
      Aucun observateur
    </div>

    <div v-else class="actor-chips">
      <div
        v-for="user in store.actors.watchers"
        :key="user.id"
        class="actor-chip chip-watcher"
      >
        <span>👁️ {{ formatUserName(user) }}</span>
        <button
          type="button"
          class="chip-remove"
          @click="store.removeActor(user.id, 3)"
        >✕</button>
      </div>
    </div>
  </div>
</section>

      <!-- ===== SECTION 2 : ÉLÉMENTS ASSOCIÉS ===== -->
      <section class="form-card">
        <h2>
          🔗 Éléments associés
          <span class="badge">{{ store.selectedItems.length }}</span>
        </h2>

        <div v-if="store.selectedItems.length === 0" class="empty-small">
          Aucun élément associé
        </div>

        <div v-else class="selected-items">
          <div
            v-for="item in store.selectedItems"
            :key="`${item.itemtype}-${item.id}`"
            class="selected-item"
          >
            <span class="item-info">
              {{ item._typeIcon }} <strong>{{ item.name }}</strong>
              <small>{{ item._typeLabel }} #{{ item.id }}</small>
            </span>
            <button
              type="button"
              class="btn-remove"
              @click="store.removeItem(item.itemtype, item.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <button type="button" class="btn btn-add" @click="openItemSelector">
          + Ajouter un élément
        </button>
      </section>

      <!-- ===== SECTION 3 : COÛTS ===== -->
      <section class="form-card">
        <h2>
          💰 Coûts associés
          <span class="badge">{{ store.costs.length }}</span>
        </h2>

        <div v-if="store.costs.length === 0" class="empty-small">
          Aucun coût ajouté
        </div>

        <div v-else class="costs-list">
          <div
            v-for="(cost, i) in store.costs"
            :key="i"
            class="cost-card"
          >
            <div class="cost-header">
              <input
                v-model="cost.name"
                type="text"
                placeholder="Nom du coût"
                class="cost-name"
              />
              <button
                type="button"
                class="btn-remove"
                @click="store.removeCost(i)"
              >
                ✕
              </button>
            </div>

            <div class="cost-fields">
              <div class="field">
                <label>Durée (secondes)</label>
                <input v-model.number="cost.actiontime" type="number" min="0" />
              </div>
              <div class="field">
                <label>Coût horaire (€)</label>
                <input v-model.number="cost.cost_time" type="number" step="0.01" min="0" />
              </div>
              <div class="field">
                <label>Coût fixe (€)</label>
                <input v-model.number="cost.cost_fixed" type="number" step="0.01" min="0" />
              </div>
              <div class="field">
                <label>Coût matériel (€)</label>
                <input v-model.number="cost.cost_material" type="number" step="0.01" min="0" />
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-add" @click="store.addCost()">
          + Ajouter un coût
        </button>
      </section>

      <!-- ===== ACTIONS ===== -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">
          Annuler
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!store.isValid || store.saving"
        >
          {{ store.saving ? '⏳ Création...' : '✅ Créer le ticket' }}
        </button>
      </div>

    </form>

    <!-- ===== MODAL SÉLECTION D'ÉLÉMENTS ===== -->
    <transition name="fade">
      <div v-if="showSelector" class="modal-overlay" @click.self="showSelector = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>📦 Sélectionner des éléments</h2>
            <button class="btn-close" @click="showSelector = false">✕</button>
          </div>

          <div class="modal-body">
            <input
              v-model="searchSelector"
              type="text"
              placeholder="🔍 Rechercher par nom..."
              class="search-input"
            />

            <div v-if="store.loadingItems" class="loading-small">
              Chargement des éléments...
            </div>

            <div v-else class="items-grid">
              <div
                v-for="item in filteredAvailable"
                :key="`${item._itemtype}-${item.id}`"
                class="item-option"
                :class="{ selected: isSelected(item) }"
                @click="toggleItem(item)"
              >
                <span class="opt-icon">{{ item._typeIcon }}</span>
                <div class="opt-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item._typeLabel }} #{{ item.id }}</small>
                </div>
                <span v-if="isSelected(item)" class="check">✓</span>
              </div>
            </div>

            <div v-if="filteredAvailable.length === 0 && !store.loadingItems" class="empty-small">
              Aucun élément trouvé
            </div>
          </div>

          <div class="modal-footer">
            <span class="info">{{ store.selectedItems.length }} sélectionné(s)</span>
            <button class="btn btn-primary" @click="showSelector = false">
              Terminer
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== MODAL SÉLECTION ACTEURS ===== -->
<transition name="fade">
  <div v-if="showActorSelector" class="modal-overlay" @click.self="showActorSelector = false">
    <div class="modal-content">
      <div class="modal-header" :class="actorHeaderClass">
        <h2>
          <span v-if="selectedActorType === 1">👤 Sélectionner les demandeurs</span>
          <span v-else-if="selectedActorType === 2">🔧 Sélectionner les techniciens</span>
          <span v-else-if="selectedActorType === 3">👁️ Sélectionner les observateurs</span>
        </h2>
        <button class="btn-close" @click="showActorSelector = false">✕</button>
      </div>

      <div class="modal-body">
        <input
          v-model="searchUser"
          type="text"
          placeholder="🔍 Rechercher un utilisateur..."
          class="search-input"
        />

        <div v-if="store.loadingUsers" class="loading-small">
          Chargement des utilisateurs...
        </div>

        <div v-else class="items-grid">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="item-option"
            :class="{ selected: isUserSelected(user) }"
            @click="toggleActor(user)"
          >
            <span class="opt-icon">
              {{ selectedActorType === 1 ? '👤' : selectedActorType === 2 ? '🔧' : '👁️' }}
            </span>
            <div class="opt-info">
              <strong>{{ formatUserName(user) }}</strong>
              <small>@{{ user.name }} • #{{ user.id }}</small>
            </div>
            <span v-if="isUserSelected(user)" class="check">✓</span>
          </div>
        </div>

        <div v-if="filteredUsers.length === 0 && !store.loadingUsers" class="empty-small">
          Aucun utilisateur trouvé
        </div>
      </div>

      <div class="modal-footer">
        <span class="info">
          {{ currentActorList.length }} {{ actorTypeLabel }} sélectionné(s)
        </span>
        <button class="btn btn-primary" @click="showActorSelector = false">
          Terminer
        </button>
      </div>
    </div>
  </div>
</transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketCreateStore } from '@/stores/FrontOffice/ticketCreateStore'


const router = useRouter()
const store  = useTicketCreateStore()

const showSelector  = ref(false)
const searchSelector = ref('')

// ✅ NOUVEAU : modal acteurs
const showActorSelector = ref(false)
const selectedActorType = ref(null)
const searchUser = ref('')

onMounted(() => {
  store.reset()
})

const filteredAvailable = computed(() => {
  if (!searchSelector.value) return store.availableItems
  const s = searchSelector.value.toLowerCase()
  return store.availableItems.filter(i =>
    i.name?.toLowerCase().includes(s) ||
    String(i.id).includes(s) ||
    i._typeLabel?.toLowerCase().includes(s)
  )
})

function isSelected(item) {
  return store.selectedItems.some(
    s => s.id === item.id && s.itemtype === item._itemtype
  )
}

function toggleItem(item) {
  if (isSelected(item)) {
    store.removeItem(item._itemtype, item.id)
  } else {
    store.addItem(item)
  }
}


// ============ ACTEURS ============
async function openActorSelector(type) {
  selectedActorType.value = type
  showActorSelector.value = true
  searchUser.value = ''

  if (store.availableUsers.length === 0) {
    await store.loadAvailableUsers()
  }
}

const filteredUsers = computed(() => {
  if (!searchUser.value) return store.availableUsers
  const s = searchUser.value.toLowerCase()
  return store.availableUsers.filter(u =>
    u.name?.toLowerCase().includes(s) ||
    u.firstname?.toLowerCase().includes(s) ||
    u.realname?.toLowerCase().includes(s)
  )
})

const currentActorList = computed(() => {
  if (selectedActorType.value === 1) return store.actors.requesters
  if (selectedActorType.value === 2) return store.actors.assignees
  if (selectedActorType.value === 3) return store.actors.watchers
  return []
})

const actorTypeLabel = computed(() => {
  return { 1: 'demandeur(s)', 2: 'technicien(s)', 3: 'observateur(s)' }[selectedActorType.value] || ''
})

const actorHeaderClass = computed(() => {
  return { 1: 'bg-blue', 2: 'bg-orange', 3: 'bg-purple' }[selectedActorType.value] || ''
})

function isUserSelected(user) {
  return currentActorList.value.some(a => a.id === user.id)
}

function toggleActor(user) {
  if (isUserSelected(user)) {
    store.removeActor(user.id, selectedActorType.value)
  } else {
    store.addActor(user, selectedActorType.value)
  }
}

function formatUserName(user) {
  if (user.firstname || user.realname) {
    return `${user.firstname || ''} ${user.realname || ''}`.trim() + ` (${user.name})`
  }
  return user.name
}


async function openItemSelector() {
  showSelector.value = true
  if (store.availableItems.length === 0) {
    await store.loadAvailableItems()
  }
}

async function onSubmit() {
  const ticketId = await store.submitTicket()
  if (ticketId) {
    setTimeout(() => {
      router.push({ name: 'items' })
    }, 1500)
  }
}

function goBack() {
  router.push({ name: 'items' })
}
</script>

<style scoped>
.create-view {
  padding: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ===== HEADER ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.btn-back {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn-back:hover { background: #f3f4f6; }

.page-header h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #1a1a2e;
}
.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* ===== MESSAGES ===== */
.msg {
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
}
.msg-success {
  background: #d1fae5;
  color: #065f46;
  border-left: 4px solid #10b981;
}
.msg-error {
  background: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

/* ===== FORM ===== */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px 25px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.form-card h2 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: #1e3a8a;
  color: #fff;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.field input,
.field select,
.field textarea {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30,58,138,0.1);
}

.field-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.req {
  color: #ef4444;
}

/* ===== ÉLÉMENTS SÉLECTIONNÉS ===== */
.selected-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 10px 14px;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.item-info strong {
  color: #1a1a2e;
}

.item-info small {
  color: #6b7280;
  font-size: 11px;
}

.btn-remove {
  background: #fee2e2;
  border: none;
  color: #c00;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.btn-remove:hover {
  background: #fecaca;
}

.empty-small {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 12px;
}

/* ===== COÛTS ===== */
.costs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.cost-card {
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 14px;
  border-radius: 10px;
}

.cost-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.cost-name {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
}

.cost-fields {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.cost-fields .field { margin-bottom: 0; }
.cost-fields label { font-size: 10px; }
.cost-fields input {
  padding: 6px 10px;
  font-size: 12px;
}

/* ===== BOUTONS ===== */
.btn {
  padding: 10px 18px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn:hover { background: #f3f4f6; }

.btn-add {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e3a8a;
  width: 100%;
}

.btn-add:hover { background: #e0e7ff; }

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  border-color: #1e3a8a;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 0;
}

/* ===== MODAL ===== */
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
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

.modal-body {
  padding: 20px 25px;
  flex: 1;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
}

.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.item-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.item-option:hover {
  background: #f9fafb;
}

.item-option.selected {
  background: #d1fae5;
  border-color: #10b981;
}

.opt-icon {
  font-size: 24px;
}

.opt-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.opt-info strong {
  font-size: 14px;
  color: #1a1a2e;
}

.opt-info small {
  font-size: 11px;
  color: #6b7280;
}

.check {
  color: #10b981;
  font-size: 18px;
  font-weight: 700;
}

.modal-footer {
  padding: 16px 25px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.loading-small {
  padding: 30px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 700px) {
  .field-row, .cost-fields {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════════
   SECTION ACTEURS
═══════════════════════════════════════════════ */
.actor-group {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e5e7eb;
}

.actor-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.actor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.actor-header label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
}

.actor-icon {
  font-size: 18px;
}

.btn-add-mini {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-mini:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.empty-mini {
  background: #f9fafb;
  padding: 10px 14px;
  border-radius: 8px;
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.actor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.actor-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.chip-requester {
  background: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

.chip-assignee {
  background: #ffedd5;
  color: #9a3412;
  border-color: #fdba74;
}

.chip-watcher {
  background: #ede9fe;
  color: #5b21b6;
  border-color: #c4b5fd;
}

.chip-remove {
  background: rgba(0,0,0,0.1);
  border: none;
  color: inherit;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-remove:hover {
  background: rgba(0,0,0,0.2);
}

/* Couleurs modal selon type acteur */
.bg-blue   { background: linear-gradient(135deg, #3b82f6, #1e40af); }
.bg-orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); } 

</style>