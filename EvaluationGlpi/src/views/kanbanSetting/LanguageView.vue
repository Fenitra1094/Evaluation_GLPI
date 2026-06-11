<template>
  <div class="languages-view">

    <!-- HEADER -->
    <header class="page-header">
      <div>
        <h1>🌍 Gestion des langues</h1>
        <p>{{ store.languages.length }} langue(s) — {{ store.activeLanguages.length }} active(s)</p>
      </div>
      <div class="header-actions">
        <router-link to="/kanban-settings" class="btn-link">
          🎨 Kanban Settings
        </router-link>
        <button class="btn-primary" @click="openCreateModal">
          ➕ Ajouter une langue
        </button>
      </div>
    </header>

    <!-- LOADING -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>Chargement des langues...</p>
    </div>

    <!-- ===== LISTE ===== -->
    <div v-else class="languages-grid">

      <div
        v-for="lang in store.languages"
        :key="lang.code"
        class="lang-card"
        :class="{ inactive: !lang.isActive, default: lang.isDefault }"
      >
        <div class="lang-flag">{{ lang.flag }}</div>
        <div class="lang-info">
          <div class="lang-name">{{ lang.name }}</div>
          <div class="lang-code">{{ lang.code.toUpperCase() }}</div>
        </div>

        <div class="lang-badges">
          <span v-if="lang.isDefault" class="badge badge-default">⭐ Défaut</span>
          <span :class="['badge', lang.isActive ? 'badge-active' : 'badge-inactive']">
            {{ lang.isActive ? '✅ Active' : '⛔ Inactive' }}
          </span>
        </div>

        <div class="lang-actions">
          <button class="btn-icon" @click="openEditModal(lang)" title="Modifier">
            ✏️
          </button>
          <button
            class="btn-icon btn-danger"
            @click="onDelete(lang)"
            :disabled="lang.isDefault"
            :title="lang.isDefault ? 'Impossible de supprimer la langue par défaut' : 'Supprimer'"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>

    <!-- ===== MODAL CRÉATION / ÉDITION ===== -->
    <transition name="fade">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">

          <div class="modal-header">
            <h2>
              {{ modal.mode === 'create' ? '➕ Nouvelle langue' : '✏️ Modifier la langue' }}
            </h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <form @submit.prevent="onSubmit" class="modal-body">

            <div class="field">
              <label>Code ISO <span class="req">*</span></label>
              <input
                v-model="modal.form.code"
                type="text"
                maxlength="5"
                required
                :disabled="modal.mode === 'edit'"
                placeholder="fr, mg, en..."
                @input="modal.form.code = modal.form.code.toLowerCase()"
              />
              <small>Code ISO 639-1 (2 caractères) ou ISO 639-2 (3 caractères)</small>
            </div>

            <div class="field">
              <label>Nom de la langue <span class="req">*</span></label>
              <input
                v-model="modal.form.name"
                type="text"
                required
                placeholder="Français, Malagasy, English..."
              />
            </div>

            <div class="field">
              <label>Drapeau (emoji) <span class="req">*</span></label>
              <input
                v-model="modal.form.flag"
                type="text"
                maxlength="4"
                required
                placeholder="🇫🇷"
              />
            </div>

            <div class="field-row">
              <label class="checkbox">
                <input type="checkbox" v-model="modal.form.isActive" />
                <span>✅ Langue active</span>
              </label>

              <label class="checkbox">
                <input type="checkbox" v-model="modal.form.isDefault" />
                <span>⭐ Langue par défaut</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn" @click="closeModal">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="store.saving">
                {{ store.saving ? '⏳' : (modal.mode === 'create' ? '➕ Créer' : '💾 Modifier') }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>

    <!-- TOAST -->
    <transition name="fade">
      <div v-if="successMsg" class="success-toast">
        ✅ {{ successMsg }}
      </div>
    </transition>

    <div v-if="store.error" class="error-toast">
      ❌ {{ store.error }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useLanguagesStore } from '@/stores/kanbanSetting/languagesStore'

const store = useLanguagesStore()

const successMsg = ref('')

const modal = reactive({
  show: false,
  mode: 'create',  // 'create' | 'edit'
  form: {
    code: '',
    name: '',
    flag: '',
    isActive: true,
    isDefault: false,
  },
  originalCode: null,
})

onMounted(() => {
  store.loadLanguages()
})

function openCreateModal() {
  modal.mode = 'create'
  modal.form = { code: '', name: '', flag: '', isActive: true, isDefault: false }
  modal.originalCode = null
  modal.show = true
}

function openEditModal(lang) {
  modal.mode = 'edit'
  modal.form = { ...lang }
  modal.originalCode = lang.code
  modal.show = true
}

function closeModal() {
  modal.show = false
}

async function onSubmit() {
  let ok = false

  if (modal.mode === 'create') {
    ok = await store.createLanguage(modal.form)
    if (ok) successMsg.value = `Langue ${modal.form.name} créée !`
  } else {
    ok = await store.updateLanguage(modal.originalCode, modal.form)
    if (ok) successMsg.value = `Langue ${modal.form.name} modifiée !`
  }

  if (ok) {
    closeModal()
    setTimeout(() => { successMsg.value = '' }, 3000)
  }
}

async function onDelete(lang) {
  if (lang.isDefault) {
    alert('Impossible de supprimer la langue par défaut')
    return
  }

  if (!confirm(`Supprimer la langue "${lang.name}" ?\n\n⚠️ Toutes les traductions associées seront perdues.`)) return

  const ok = await store.deleteLanguage(lang.code)
  if (ok) {
    successMsg.value = `Langue ${lang.name} supprimée`
    setTimeout(() => { successMsg.value = '' }, 3000)
  }
}
</script>

<style scoped>
.languages-view {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
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
}
.page-header h1 { margin: 0; font-size: 22px; }
.page-header p { margin: 4px 0 0 0; opacity: 0.8; font-size: 13px; }
.header-actions { display: flex; gap: 10px; }

.btn-link {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
}
.btn-link:hover { background: rgba(255,255,255,0.25); }

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.btn-primary:hover { opacity: 0.9; }

.loading-card {
  background: #fff;
  padding: 60px;
  border-radius: 14px;
  text-align: center;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* GRID */
.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.lang-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  transition: all 0.2s;
  border: 2px solid transparent;
}
.lang-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.lang-card.inactive { opacity: 0.6; }
.lang-card.default {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fffbeb, #fff);
}

.lang-flag {
  font-size: 50px;
  text-align: center;
  margin-bottom: 12px;
}

.lang-info {
  text-align: center;
  margin-bottom: 12px;
}
.lang-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}
.lang-code {
  font-size: 11px;
  color: #6b7280;
  font-family: monospace;
  font-weight: 600;
  margin-top: 2px;
}

.lang-badges {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.badge {
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 100px;
  font-weight: 700;
}
.badge-default { background: #fef3c7; color: #92400e; }
.badge-active   { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #fee2e2; color: #991b1b; }

.lang-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.btn-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}
.btn-icon:hover { background: #f3f4f6; }
.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-icon.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
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
  max-width: 500px;
  overflow: hidden;
}
.modal-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 { margin: 0; font-size: 16px; }

.btn-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 28px; height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 700;
}

.modal-body { padding: 22px; }

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.field label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
}
.field input[type="text"] {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}
.field input:focus { border-color: #1e3a8a; }
.field input:disabled { background: #f3f4f6; cursor: not-allowed; }
.field small {
  font-size: 11px;
  color: #9ca3af;
}

.field-row {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #1a1a2e;
  font-weight: 600;
}
.checkbox input { cursor: pointer; }

.req { color: #ef4444; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn {
  padding: 10px 22px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn:hover { background: #f3f4f6; }

/* TOAST */
.success-toast, .error-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 10px;
  font-weight: 600;
  z-index: 2000;
}
.success-toast { background: #d1fae5; color: #065f46; border-left: 4px solid #10b981; }
.error-toast   { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>