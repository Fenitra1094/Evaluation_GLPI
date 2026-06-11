<template>
  <div class="settings-view">

    <!-- HEADER -->
    <header class="page-header">
      <div>
        <h1>🎨 Personnalisation du Kanban</h1>
        <p>Couleurs et noms multilingues des colonnes</p>
      </div>
      <div class="header-actions">
        <router-link to="/languages" class="btn-link">
          🌍 Gérer les langues
        </router-link>
        <button class="btn-reset" @click="onReset" :disabled="store.saving">
          🔄 Réinitialiser
        </button>
      </div>
    </header>

    <!-- LOADING -->
    <div v-if="store.loading || langStore.loading" class="loading-card">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <template v-else>

      <!-- ===== CHOIX LANGUE D'APERÇU ===== -->
      <div class="language-card">
        <h3>👁️ Langue d'aperçu</h3>
        <div class="language-toggle">
          <button
            v-for="lang in langStore.activeLanguages"
            :key="lang.code"
            class="lang-btn"
            :class="{ active: previewLang === lang.code }"
            @click="previewLang = lang.code"
          >
            {{ lang.flag }} {{ lang.name }}
          </button>
        </div>
      </div>

      <!-- ===== APERÇU ===== -->
      <div class="preview-card">
        <h3>📋 Aperçu en {{ getCurrentLangName() }}</h3>
        <div class="preview-board">
          <div
            v-for="col in localSettings"
            :key="col.id"
            class="preview-column"
            :style="{ borderTopColor: col.color }"
          >
            <div class="preview-header">
              {{ col.icon }} {{ getTranslation(col, previewLang) || '(vide)' }}
            </div>
            <div class="preview-body">
              <div class="preview-ticket" :style="{ borderLeftColor: col.color }">
                #1 Exemple
              </div>
              <div class="preview-ticket" :style="{ borderLeftColor: col.color }">
                #2 Exemple
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== FORMULAIRE ===== -->
      <div class="settings-grid">
        <div
          v-for="col in localSettings"
          :key="col.id"
          class="setting-card"
        >
          <div class="setting-header" :style="{ background: col.color }">
            <span class="setting-icon">{{ col.icon }}</span>
            <div>
              <div class="setting-key">{{ col.columnKey.toUpperCase() }}</div>
              <div class="setting-status">Status GLPI : {{ col.status }}</div>
            </div>
          </div>

          <div class="setting-body">

            <!-- Icône -->
            <div class="field">
              <label>🎯 Icône (emoji)</label>
              <input v-model="col.icon" type="text" maxlength="4" />
            </div>

            <!-- Couleur -->
            <div class="field">
              <label>🎨 Couleur</label>
              <div class="color-input-group">
                <input v-model="col.color" type="color" class="color-picker" />
                <input v-model="col.color" type="text" class="color-text" />
              </div>
            </div>

            <!-- Traductions dynamiques -->
            <div class="translations-section">
              <h4>🌍 Traductions</h4>
              <div
                v-for="lang in langStore.activeLanguages"
                :key="lang.code"
                class="field"
              >
                <label>{{ lang.flag }} {{ lang.name }}</label>
                <input
                  :value="getTranslation(col, lang.code)"
                  @input="setTranslation(col, lang.code, $event.target.value)"
                  type="text"
                  :placeholder="`Nom en ${lang.name}...`"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== ACTIONS ===== -->
      <div class="actions-bar">
        <button class="btn" @click="onCancel" :disabled="store.saving">
          ❌ Annuler
        </button>
        <button class="btn btn-primary" @click="onSave" :disabled="store.saving">
          {{ store.saving ? '⏳ Sauvegarde...' : '💾 Enregistrer' }}
        </button>
      </div>

      <!-- TOAST -->
      <transition name="fade">
        <div v-if="showSuccess" class="success-toast">
          ✅ Paramètres sauvegardés !
        </div>
      </transition>

      <div v-if="store.error" class="error-toast">
        ❌ {{ store.error }}
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useKanbanSettingsStore } from '@/stores/kanbanSetting/kanbanSettingsStore'
import { useLanguagesStore } from '@/stores/kanbanSetting/languagesStore'

const store = useKanbanSettingsStore()
const langStore = useLanguagesStore()

const localSettings = ref([])
const previewLang = ref('fr')
const showSuccess = ref(false)

onMounted(async () => {
  await langStore.loadLanguages()
  await store.loadSettings()
  resetLocal()
  previewLang.value = langStore.defaultLanguage?.code || 'fr'
})

watch(() => store.settings, () => resetLocal(), { deep: true })

function resetLocal() {
  localSettings.value = JSON.parse(JSON.stringify(store.settings))
}

function getTranslation(setting, langCode) {
  const t = setting.translations?.find(tr => tr.languageCode === langCode)
  return t?.label || ''
}

function setTranslation(setting, langCode, value) {
  if (!setting.translations) setting.translations = []

  const existing = setting.translations.find(t => t.languageCode === langCode)
  if (existing) {
    existing.label = value
  } else {
    setting.translations.push({ languageCode: langCode, label: value })
  }
}

function getCurrentLangName() {
  const lang = langStore.activeLanguages.find(l => l.code === previewLang.value)
  return lang ? `${lang.flag} ${lang.name}` : previewLang.value
}

async function onSave() {
  const ok = await store.saveAll(localSettings.value)
  if (ok) {
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  }
}

function onCancel() {
  resetLocal()
}

async function onReset() {
  if (!confirm('Réinitialiser tous les paramètres ?')) return
  await store.resetSettings()
  resetLocal()
}
</script>

<style scoped>
.settings-view {
  padding: 30px;
  max-width: 1300px;
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

.btn-link, .btn-reset {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
}
.btn-link:hover, .btn-reset:hover { background: rgba(255,255,255,0.25); }

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

.language-card, .preview-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.language-card h3, .preview-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1a1a2e;
}

.language-toggle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.lang-btn {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.lang-btn:hover { background: #f9fafb; }
.lang-btn.active {
  border-color: #1e3a8a;
  background: #eff6ff;
  color: #1e3a8a;
}

.preview-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.preview-column {
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px;
  border-top: 4px solid #94a3b8;
}
.preview-header {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 10px;
}
.preview-body { display: flex; flex-direction: column; gap: 6px; }
.preview-ticket {
  background: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #cbd5e1;
  font-size: 12px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}
.setting-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.setting-header {
  padding: 16px 18px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}
.setting-icon { font-size: 30px; }
.setting-key { font-size: 16px; font-weight: 700; }
.setting-status { font-size: 11px; opacity: 0.9; }

.setting-body { padding: 18px; }

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

.color-input-group { display: flex; gap: 8px; align-items: center; }
.color-picker {
  width: 50px; height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
}
.color-text {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
}

.translations-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed #e5e7eb;
}
.translations-section h4 {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #1a1a2e;
  text-transform: uppercase;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
}
.btn {
  padding: 10px 22px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn:hover { background: #f3f4f6; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: #fff;
  border-color: #1e3a8a;
}

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

@media (max-width: 900px) {
  .settings-grid, .preview-board { grid-template-columns: 1fr; }
}
</style>