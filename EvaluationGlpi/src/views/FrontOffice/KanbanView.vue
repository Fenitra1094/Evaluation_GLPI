<template>
  <div class="kanban-view">

    <!-- ===== HEADER avec sélecteur de langue ===== -->
    <header class="page-header">
      <div>
        <h1>🎯 Tableau Kanban</h1>
        <p>Glissez les tickets pour changer leur statut</p>
      </div>
      <div class="header-actions">
        <!-- Sélecteur de langue -->
        <div class="lang-switcher">
          <button
            v-for="lang in langStore.activeLanguages"
            :key="lang.code"
            class="lang-mini-btn"
            :class="{ active: langStore.currentLang === lang.code }"
            @click="changeLanguage(lang.code)"
            :title="lang.name"
          >
            {{ lang.flag }}
          </button>
        </div>
        <button class="btn-refresh" @click="store.loadTickets()" :disabled="store.loading">
          🔄 Actualiser
        </button>
      </div>
    </header>

    <!-- ===== LOADING ===== -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>Chargement des tickets...</p>
    </div>

    <!-- ===== KANBAN BOARD ===== -->
    <div v-else class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.id"
        :style="{
          borderTopColor: col.color,
          background: hexToRgba(col.color, 0.05)   /* ⭐ Fond léger coloré */
        }"
      >
        <div class="column-header"
            :style="{
            background: col.color,
            color: '#fff'
          }">
          <span class="col-title">
            {{ col.icon }} {{ settingsStore.getLabel(col) }}
          </span>
          <span class="col-count">{{ store.totalByColumn[col.columnKey] || 0 }}</span>
        </div>

        <VueDraggable
          v-model="store.ticketsByColumn[col.columnKey]"
          :group="{ name: 'tickets' }"
          class="column-body"
          item-key="id"
          @add="onDrop($event, col)"
        >
          <div
            v-for="ticket in store.ticketsByColumn[col.columnKey]"
            :key="ticket.id"
            class="ticket-card"
            :style="{
              borderLeft: `5px solid ${col.color}`,      /* ⭐ Bordure épaisse */
              background: hexToRgba(col.color, 0.08)     /* ⭐ Fond teinté */
            }"
            @click="ticketsStore.selectTicket(ticket)"
          >
            <div class="ticket-id">#{{ ticket.id }}</div>
            <div class="ticket-name">{{ ticket.name }}</div>
            <div class="ticket-meta">
              <span class="meta-type" :class="`type-${ticket.type}`">
                {{ ticket.type === 1 ? '⚠️ Incident' : '📩 Demande' }}
              </span>
              <span class="meta-priority" :class="`pri-${ticket.priority}`">
                P{{ ticket.priority }}
              </span>
            </div>
          </div>
        </VueDraggable>

        <button
          v-if="col.columnKey === 'new'"
          class="btn-add-ticket"
          @click="goToCreateTicket"
        >
          + Ajouter 1 ticket
        </button>
      </div>
    </div>

    <!-- ===== PANNEAU DÉTAIL ===== -->
    <transition name="slide-right">
      <aside v-if="ticketsStore.selectedTicket" class="detail-panel">
        <div class="panel-header">
          <h2>Détails du ticket</h2>
          <button class="btn-close" @click="ticketsStore.closeTicket()">✕</button>
        </div>

        <div class="panel-body">
          <div v-if="ticketsStore.loadingDetails" class="loading-mini">
            <div class="spinner"></div>
            <p>Chargement des détails...</p>
          </div>

          <template v-else>
            <div class="detail-line">
              <span class="lbl">ID</span>
              <span class="val">#{{ ticketsStore.selectedTicket.id }}</span>
            </div>
            <div class="detail-line">
              <span class="lbl">Titre</span>
              <span class="val">{{ ticketsStore.selectedTicket.name }}</span>
            </div>
            <div class="detail-line">
              <span class="lbl">Type</span>
              <span class="val">
                {{ ticketsStore.selectedTicket.type === 1 ? '⚠️ Incident' : '📩 Demande' }}
              </span>
            </div>
            <div class="detail-line">
              <span class="lbl">Statut</span>
              <span class="val">{{ getStatusLabel(ticketsStore.selectedTicket.status) }}</span>
            </div>
            <div class="detail-line">
              <span class="lbl">Priorité</span>
              <span class="val">P{{ ticketsStore.selectedTicket.priority }}</span>
            </div>
            <div class="detail-line">
              <span class="lbl">Créé le</span>
              <span class="val">{{ formatDate(ticketsStore.selectedTicket.date) }}</span>
            </div>

            <div class="detail-section">
              <h3>📝 Description</h3>
              <div class="content-box" v-html="ticketsStore.selectedTicket.content || '<em>Aucune</em>'"></div>
            </div>

            <div v-if="ticketsStore.ticketItems.length > 0" class="detail-section">
              <h3>📦 Éléments liés ({{ ticketsStore.ticketItems.length }})</h3>
              <div
                v-for="item in ticketsStore.ticketItems"
                :key="item.id"
                class="item-box"
              >
                <div class="item-type">{{ item.itemtype }}</div>
                <div class="item-name">{{ item.details?.name || `#${item.items_id}` }}</div>
                <div v-if="item.details?.serial" class="item-meta">
                  🔢 {{ item.details.serial }}
                </div>
              </div>
            </div>

            <div v-if="ticketsStore.ticketCosts.length > 0" class="detail-section">
              <h3>💰 Coûts ({{ ticketsStore.ticketCosts.length }})</h3>
              <div
                v-for="cost in ticketsStore.ticketCosts"
                :key="cost.id"
                class="cost-box"
              >
                <div class="cost-name">{{ cost.name || 'Sans nom' }}</div>
                <div class="cost-amounts">
                  <span v-if="cost.cost_time">⏱️ {{ cost.cost_time }} €</span>
                  <span v-if="cost.cost_fixed">💵 {{ cost.cost_fixed }} €</span>
                  <span v-if="cost.cost_material">🔧 {{ cost.cost_material }} €</span>
                </div>
              </div>
            </div>

            <div v-if="ticketsStore.ticketCosts.length > 0" class="cost-total">
              💸 Total : {{ totalCosts }} €
            </div>
          </template>
        </div>
      </aside>
    </transition>

    <!-- ===== MODAL : DIALOGUE TRANSITION ===== -->
    <transition name="fade">
      <div v-if="dialog.show" class="modal-overlay" @click.self="cancelTransition">
        <div class="modal-content">

          <div class="modal-header" :class="dialogHeaderClass(dialog.type)">
            <h2>
              <span v-if="dialog.type === 'assign'">👤 Assigner un acteur</span>
              <span v-else-if="dialog.type === 'solution'">✅ Solution / Résolution</span>
              <span v-else-if="dialog.type === 'reopen'">🔄 Réouverture du ticket</span>
            </h2>
            <button class="btn-close" @click="cancelTransition">✕</button>
          </div>

          <div class="modal-body">
            <div class="ticket-info-box">
              <div class="info-line">
                <span class="info-lbl">Ticket :</span>
                <strong>#{{ dialog.ticketId }} — {{ dialog.ticketName }}</strong>
              </div>
              <div class="info-line">
                <span class="info-lbl">Transition :</span>
                <span>
                  {{ getStatusLabel(dialog.oldStatus) }} → {{ getStatusLabel(dialog.newStatus) }}
                </span>
              </div>
            </div>

            <template v-if="dialog.type === 'assign'">
              <p class="modal-intro">
                Pour passer ce ticket en <strong>In progress</strong>,
                sélectionnez l'acteur responsable.
              </p>
              <div class="field">
                <label>Utilisateur assigné <span class="req">*</span></label>
                <select v-model="dialog.userId" required>
                  <option :value="null">-- Sélectionner --</option>
                  <option v-for="u in store.availableUsers" :key="u.id" :value="u.id">
                    {{ u.name }}
                    <span v-if="u.firstname || u.realname">
                      ({{ u.firstname }} {{ u.realname }})
                    </span>
                  </option>
                </select>
              </div>
              <button class="btn" @click="cancelTransition">Annuler</button>
              <button class="btn btn-primary" @click="confirmTransition">
                ✅ Confirmer
              </button>
            </template>

            <template v-if="dialog.type === 'solution'">
              <p class="modal-intro">
                Pour clore ce ticket, veuillez décrire la <strong>solution apportée</strong>.
              </p>
              <div class="field">
                <label>Cout <span class="req">*</span></label>
                <input type="number" v-model="dialog.cout" value="" >
                <!-- <textarea
                  v-model="dialog.cout"
                  rows="5"
                  placeholder="Décrivez comment le problème a été résolu..."
                  required
                ></textarea> -->
                
              </div>
              <button class="btn" @click="cancelTransition">Annuler</button>
              <button class="btn btn-primary" @click="confirmTransition">
                ✅ Confirmer
              </button>
            </template>

            <template v-if="dialog.type === 'reopen'">
              <p class="modal-intro">
                Vous réouvrez ce ticket. Vous pouvez ajouter une raison (optionnel).
              </p>
              <div class="field">
                <label>Raison de la réouverture (optionnel)</label>
                <input type="number" v-model="dialog.pourcentage">
                  
              </div>
              <button @click="annulation">Annulation</button>
              <button class="btn btn-primary" @click="confirmTransition">
                ✅ Confirmer
              </button>
            </template>

            

          </div>
        </div>
      </div>
    </transition>

    <!-- ===== ERREUR TOAST ===== -->
    <div v-if="store.error" class="error-toast">
      ❌ {{ store.error }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VueDraggable } from 'vue-draggable-plus'
import { useKanbanStore } from '@/stores/FrontOffice/kanbanStore'
import { useKanbanSettingsStore } from '@/stores/kanbanSetting/kanbanSettingsStore'
import { useLanguagesStore } from '@/stores/kanbanSetting/languagesStore'
import { useTicketsStore } from '@/stores/ticketsStore'

const router        = useRouter()
const store         = useKanbanStore()
const settingsStore = useKanbanSettingsStore()
const langStore     = useLanguagesStore()
const ticketsStore  = useTicketsStore()

// ============ COLONNES DYNAMIQUES ============
const columns = computed(() => settingsStore.settings)

// ============ COMPUTED : TOTAL COÛTS ============
const totalCosts = computed(() => {
  if (!ticketsStore.ticketCosts.length) return 0
  return ticketsStore.ticketCosts.reduce((sum, c) => {
    return sum + (Number(c.cost_time) || 0)
               + (Number(c.cost_fixed) || 0)
               + (Number(c.cost_material) || 0)
  }, 0).toFixed(2)
})

// ============ DIALOGUE DE TRANSITION ============
const dialog = reactive({
  show: false, ticketId: null, ticketName: '',
  oldStatus: null, newStatus: null, type: null,
  required: false, userId: null, solution: '', comment: '',
})

// ============ LIFECYCLE ============
onMounted(async () => {
  await langStore.loadLanguages()
  await settingsStore.loadSettings()
  await store.loadTickets()
  await store.loadUsers()
})

// ============ DRAG & DROP ============
async function onDrop(event, targetColumn) {
  const ticket = event.data
  if (!ticket) return

  const oldStatus = ticket.status
  const newStatus = targetColumn.status

  if (oldStatus === newStatus) return

  // Règles de transition
  if (oldStatus === 1 && newStatus === 2) {
    return openDialog(ticket, oldStatus, newStatus, 'assign', true)
  }
  if (oldStatus === 2 && newStatus === 6) {
    return openDialog(ticket, oldStatus, newStatus, 'solution', true)
  }
  if (oldStatus === 6 && newStatus === 2) {
    return openDialog(ticket, oldStatus, newStatus, 'reopen', false)
  }
  if (oldStatus === 6) {
    return openDialog(ticket, oldStatus, newStatus, 'reopen', false)
  }

  // Transition directe sans dialogue
  const ok = await store.changeStatus(ticket.id, newStatus)
  if (!ok) await store.loadTickets()
}

function openDialog(ticket, oldStatus, newStatus, type, required) {
  dialog.show       = true
  dialog.ticketId   = ticket.id
  dialog.ticketName = ticket.name
  dialog.oldStatus  = oldStatus
  dialog.newStatus  = newStatus
  dialog.type       = type
  dialog.required   = required
  dialog.userId     = null
  dialog.solution   = ''
  dialog.comment    = ''
}
async function annulation() {
  const annuler = await store.annulation(dialog.ticketId)
  closeDialog()
}

async function confirmTransition() {
  if (dialog.required) {
    if (dialog.type === 'assign' && !dialog.userId) {
      alert('Veuillez sélectionner un utilisateur')
      return
    }
    if (dialog.type === 'solution' && dialog.cout === 0 ) {
      alert('Veuillez saisir le cout ')
      return
    }
  }

  const extra = {}
  if (dialog.userId)   extra.userId   = dialog.userId
  if (dialog.cout) extra.cout = dialog.cout
  if (dialog.comment)  extra.comment  = dialog.comment
  if (dialog.pourcentage)  extra.pourcentage  = dialog.pourcentage

  const ok = await store.changeStatus(dialog.ticketId, dialog.newStatus, extra)
  if (!ok) await store.loadTickets()

  closeDialog()
}

async function cancelTransition() {
  closeDialog()
  await store.loadTickets()
}

function closeDialog() {
  dialog.show = false
  dialog.ticketId = null
}

// ============ NAVIGATION ============
function goToCreateTicket() {
  router.push('/createTicket')
}

// ============ HELPERS ============
function dialogHeaderClass(type) {
  return {
    'assign'   : 'bg-orange',
    'solution' : 'bg-green',
    'reopen'   : 'bg-purple',
  }[type] || 'bg-blue'
}

function getStatusLabel(status) {
  const setting = settingsStore.settingsByStatus[status]
  if (setting) return `${setting.icon} ${settingsStore.getLabel(setting)}`

  const fallback = {
    3: '🟣 Planifié',
    4: '🟡 En attente',
    5: '🟢 Résolu',
  }
  return fallback[status] || 'Inconnu'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function changeLanguage(code) {
  langStore.setCurrentLang(code)
}

// ============ HELPER COULEUR ============
/**
 * Convertit un hex #ff0000 en rgba(255, 0, 0, alpha)
 * Utilisé pour créer un fond transparent à partir de la couleur
 */
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(100, 116, 139, ${alpha})`

  // Enlever le #
  const cleaned = hex.replace('#', '')

  // Convertir en RGB
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
/* Ton CSS reste identique - aucun changement nécessaire */
.kanban-view {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  color: #fff;
  padding: 22px 30px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.page-header h1 { margin: 0; font-size: 22px; }
.page-header p  { margin: 4px 0 0 0; opacity: 0.8; font-size: 13px; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-switcher {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.1);
  padding: 4px;
  border-radius: 100px;
}

.lang-mini-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lang-mini-btn:hover { background: rgba(255,255,255,0.15); }
.lang-mini-btn.active {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.btn-refresh {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.loading-card {
  background: #fff;
  padding: 60px;
  border-radius: 14px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* KANBAN */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.kanban-column {
  background: #f9fafb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  border-top: 4px solid #94a3b8;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.col-title { font-size: 14px; font-weight: 700; color: #1a1a2e; }
.col-count {
  background: #1a1a2e;
  color: #fff;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
  flex: 1;
}

.ticket-card {
  background: #fff;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-left: 3px solid #cbd5e1;
  transition: all 0.15s;
}
.ticket-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.ticket-card:active { cursor: grabbing; }

.ticket-id { font-size: 10px; font-weight: 700; color: #6b7280; margin-bottom: 4px; }
.ticket-name { font-size: 13px; color: #1a1a2e; font-weight: 600; margin-bottom: 8px; line-height: 1.3; }

.ticket-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-type, .meta-priority { font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; }
.type-1 { background: #fee2e2; color: #991b1b; }
.type-2 { background: #dbeafe; color: #1e40af; }
.pri-1 { background: #f3f4f6; color: #1f2937; }
.pri-2 { background: #dbeafe; color: #1e40af; }
.pri-3 { background: #fef3c7; color: #854d0e; }
.pri-4 { background: #ffedd5; color: #9a3412; }
.pri-5 { background: #fee2e2; color: #991b1b; }
.pri-6 { background: #ede9fe; color: #5b21b6; }

.btn-add-ticket {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}
.btn-add-ticket:hover {
  background: #f0f9ff;
  border-color: #3b82f6;
  color: #1e40af;
}

/* PANNEAU DÉTAIL */
.detail-panel {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 400px;
  background: #fff;
  box-shadow: -8px 0 30px rgba(0,0,0,0.15);
  z-index: 800;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h2 { margin: 0; font-size: 16px; }

.panel-body { padding: 20px 22px; flex: 1; overflow-y: auto; }

.detail-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.lbl { color: #6b7280; font-weight: 600; }
.val { color: #1a1a2e; max-width: 60%; text-align: right; word-break: break-word; }

.detail-section { margin-top: 18px; }
.detail-section h3 { font-size: 13px; margin-bottom: 8px; color: #1a1a2e; }
.content-box {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.loading-mini { text-align: center; padding: 40px 20px; }
.loading-mini .spinner { width: 30px; height: 30px; margin: 0 auto 10px; }
.loading-mini p { font-size: 12px; color: #6b7280; }

.item-box, .cost-box {
  background: #f9fafb;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid #3b82f6;
}

.item-type {
  font-size: 10px;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.item-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.item-meta { font-size: 11px; color: #6b7280; margin-top: 3px; }

.cost-box { border-left-color: #10b981; }
.cost-name { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-bottom: 5px; }
.cost-amounts { display: flex; gap: 8px; flex-wrap: wrap; }
.cost-amounts span {
  font-size: 11px;
  background: #d1fae5;
  color: #065f46;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 600;
}

.cost-total {
  margin-top: 15px;
  padding: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
}

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 550px;
  overflow: hidden;
}

.modal-header {
  padding: 18px 22px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-blue   { background: linear-gradient(135deg, #3b82f6, #1e40af); }
.bg-orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.bg-green  { background: linear-gradient(135deg, #10b981, #059669); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.modal-header h2 { margin: 0; font-size: 16px; }

.btn-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 28px; height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.modal-body { padding: 22px; }

.modal-intro {
  margin-bottom: 16px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.ticket-info-box {
  background: #f3f4f6;
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 3px solid #3b82f6;
}

.info-line { display: flex; gap: 8px; font-size: 13px; padding: 3px 0; }
.info-lbl { color: #6b7280; font-weight: 600; min-width: 90px; }

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
}
.field input, .field textarea, .field select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}
.field input:focus, .field textarea:focus, .field select:focus {
  border-color: #1e3a8a;
}
.field textarea { resize: vertical; min-height: 80px; }
.req { color: #ef4444; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 9px 18px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn:hover { background: #f3f4f6; }

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  border-color: #1e3a8a;
}

.error-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #fee2e2;
  color: #991b1b;
  padding: 14px 20px;
  border-radius: 10px;
  border-left: 4px solid #ef4444;
  font-weight: 600;
  z-index: 2000;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

@media (max-width: 900px) {
  .kanban-board { grid-template-columns: 1fr; }
  .detail-panel { width: 100%; }
}
</style>