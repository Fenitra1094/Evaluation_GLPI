<template>
  <div class="import-view">

    <!-- ===== HEADER AVEC DÉGRADÉ ===== -->
    <header class="hero-header">
      <div class="hero-content">
        <div class="hero-icon">🚀</div>
        <div>
          <h1>Import Multi-Sources</h1>
          <p>Intégrez vos données GLPI en un seul clic avec rollback automatique</p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="stat-num">{{ totalLines }}</span>
          <span class="stat-lbl">lignes à traiter</span>
        </div>
      </div>
    </header>

    <!-- ===== TIMELINE ÉTAPES ===== -->
    <div class="steps-timeline">
      <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
        <div class="step-circle">1</div>
        <span>Fichiers</span>
      </div>
      <div class="step-line"></div>
      <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
        <div class="step-circle">2</div>
        <span>Import</span>
      </div>
      <div class="step-line"></div>
      <div class="step-item" :class="{ active: currentStep >= 3 }">
        <div class="step-circle">3</div>
        <span>Rapport</span>
      </div>
    </div>

    <!-- ===== ÉTAPE 1 : SÉLECTION ===== -->
    <section class="section-block">
      <div class="section-header">
        <div class="section-number">01</div>
        <div>
          <h2>Sources de données</h2>
          <p>Glissez ou sélectionnez vos fichiers</p>
        </div>
      </div>

      <div class="files-grid">

        <!-- ASSETS -->
        <div
          class="file-tile"
          :class="{ loaded: store.assetsData.rows.length > 0 }"
        >
          <div class="tile-icon-wrap purple">
            <span class="tile-icon">📋</span>
          </div>
          <div class="tile-body">
            <h3>Assets</h3>
            <p>Computers, Monitors, Printers...</p>
            <label class="file-btn">
              <input
                type="file"
                accept=".csv"
                @change="handleAssetsFile"
                :disabled="store.phase === 'importing'"
                hidden
              />
              <span v-if="!store.assetsFile">Choisir un fichier CSV</span>
              <span v-else>✓ {{ store.assetsFile.name }}</span>
            </label>
            <div v-if="store.assetsData.rows.length > 0" class="tile-badge">
              {{ store.assetsData.rows.length }} lignes détectées
            </div>
          </div>
        </div>

        <!-- TICKETS -->
        <div
          class="file-tile"
          :class="{ loaded: store.ticketsData.rows.length > 0 }"
        >
          <div class="tile-icon-wrap blue">
            <span class="tile-icon">🎫</span>
          </div>
          <div class="tile-body">
            <h3>Tickets</h3>
            <p>Incidents, demandes, problèmes</p>
            <label class="file-btn">
              <input
                type="file"
                accept=".csv"
                @change="handleTicketsFile"
                :disabled="store.phase === 'importing'"
                hidden
              />
              <span v-if="!store.ticketsFile">Choisir un fichier CSV</span>
              <span v-else>✓ {{ store.ticketsFile.name }}</span>
            </label>
            <div v-if="store.ticketsData.rows.length > 0" class="tile-badge">
              {{ store.ticketsData.rows.length }} lignes détectées
            </div>
          </div>
        </div>

        <!-- COÛTS -->
        <div
          class="file-tile"
          :class="{ loaded: store.costsData.rows.length > 0 }"
        >
          <div class="tile-icon-wrap orange">
            <span class="tile-icon">💰</span>
          </div>
          <div class="tile-body">
            <h3>Coûts</h3>
            <p>Durée, coûts horaires & fixes</p>
            <label class="file-btn">
              <input
                type="file"
                accept=".csv"
                @change="handleCostsFile"
                :disabled="store.phase === 'importing'"
                hidden
              />
              <span v-if="!store.costsFile">Choisir un fichier CSV</span>
              <span v-else>✓ {{ store.costsFile.name }}</span>
            </label>
            <div v-if="store.costsData.rows.length > 0" class="tile-badge">
              {{ store.costsData.rows.length }} lignes détectées
            </div>
          </div>
        </div>

        <!-- IMAGES -->
        <div
          class="file-tile"
          :class="{ loaded: store.imagesFile }"
        >
          <div class="tile-icon-wrap green">
            <span class="tile-icon">🖼️</span>
          </div>
          <div class="tile-body">
            <h3>Images</h3>
            <p>Archive ZIP (PNG, JPG, JPEG)</p>
            <label class="file-btn">
              <input
                type="file"
                accept=".zip"
                @change="handleImagesFile"
                :disabled="store.phase === 'importing'"
                hidden
              />
              <span v-if="!store.imagesFile">Choisir un fichier ZIP</span>
              <span v-else>✓ {{ store.imagesFile.name }}</span>
            </label>
            <div v-if="store.imagesFile" class="tile-badge">
              Archive prête
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ===== ÉTAPE 2 : LANCER ===== -->
    <section class="section-block action-block">
      <div class="section-header">
        <div class="section-number">02</div>
        <div>
          <h2>Lancer l'import</h2>
          <p>Le rollback est automatique en cas d'erreur</p>
        </div>
      </div>

      <div class="action-buttons">
        <button
          class="btn-launch"
          @click="store.importAll()"
          :disabled="!canImport || store.phase === 'importing'"
        >
          <span class="btn-icon">⚡</span>
          <span>Lancer l'import global</span>
        </button>

        <button
          class="btn-clear"
          @click="store.reset()"
          :disabled="store.phase === 'importing'"
        >
          ↻ Tout effacer
        </button>
      </div>

      <div v-if="!canImport" class="hint-message">
        💡 Sélectionne au moins un fichier pour démarrer
      </div>
    </section>

    <!-- ===== ERREURS DE VALIDATION ===== -->
    <transition name="slide">
      <section v-if="store.errors.length > 0" class="error-section">
        <div class="error-header">
          <span class="error-icon">⚠️</span>
          <h3>{{ store.errors.length }} erreur(s) à corriger</h3>
        </div>
        <ul class="error-list">
          <li v-for="(e, i) in store.errors" :key="i">{{ e }}</li>
        </ul>
      </section>
    </transition>

    <!-- ===== PROGRESSION ===== -->
    <transition name="slide">
      <section v-if="store.phase === 'importing'" class="progress-section">
        <div class="progress-header">
          <div class="loader"></div>
          <div>
            <h3>Import en cours</h3>
            <p>{{ store.progress.label }}</p>
          </div>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          >
            <span class="progress-text">{{ progressPercent }}%</span>
          </div>
        </div>

        <div class="progress-info">
          {{ store.progress.current }} / {{ store.progress.total }} éléments
        </div>
      </section>
    </transition>

    <!-- ===== RAPPORT SUCCÈS ===== -->
    <transition name="slide">
      <section v-if="store.report && store.phase === 'done'" class="success-section">
        <div class="success-banner">
          <div class="success-icon-wrap">
            <span class="success-icon">✨</span>
          </div>
          <div>
            <h2>Import terminé avec succès !</h2>
            <p>{{ store.report.success }} élément(s) ajouté(s) dans GLPI</p>
          </div>
        </div>

        <div class="success-stats">
          <div class="success-stat purple">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <span class="stat-value">{{ store.report.assets?.length || 0 }}</span>
              <span class="stat-label">Assets</span>
            </div>
          </div>
          <div class="success-stat blue">
            <div class="stat-icon">🎫</div>
            <div class="stat-content">
              <span class="stat-value">{{ store.report.tickets?.length || 0 }}</span>
              <span class="stat-label">Tickets</span>
            </div>
          </div>
          <div class="success-stat orange">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <span class="stat-value">{{ store.report.costs?.length || 0 }}</span>
              <span class="stat-label">Coûts</span>
            </div>
          </div>
          <div class="success-stat green">
            <div class="stat-icon">🖼️</div>
            <div class="stat-content">
              <span class="stat-value">{{ store.report.images?.length || 0 }}</span>
              <span class="stat-label">Images</span>
            </div>
          </div>
        </div>

        <div class="details-grid">
          <details v-if="store.report.assets?.length" class="detail-card">
            <summary>📦 Voir les Assets ({{ store.report.assets.length }})</summary>
            <ul>
              <li v-for="(a, i) in store.report.assets" :key="i">
                <span class="badge">{{ a.type }}</span> {{ a.name }} <em>#{{ a.id }}</em>
              </li>
            </ul>
          </details>

          <details v-if="store.report.tickets?.length" class="detail-card">
            <summary>🎫 Voir les Tickets ({{ store.report.tickets.length }})</summary>
            <ul>
              <li v-for="(t, i) in store.report.tickets" :key="i">
                <strong>Ref {{ t.refTicket }}</strong> — {{ t.titre }} <em>#{{ t.id }}</em>
                <ul v-if="t.linkedItems.length > 0" class="sub-list">
                  <li v-for="(item, j) in t.linkedItems" :key="j">
                    → {{ item.itemtype }} : {{ item.name }}
                  </li>
                </ul>
              </li>
            </ul>
          </details>

          <details v-if="store.report.costs?.length" class="detail-card">
            <summary>💰 Voir les Coûts ({{ store.report.costs.length }})</summary>
            <ul>
              <li v-for="(c, i) in store.report.costs" :key="i">
                Ticket Ref <strong>{{ c.refTicket }}</strong> → Coût <em>#{{ c.costId }}</em>
              </li>
            </ul>
          </details>

          <details v-if="store.report.images?.length" class="detail-card">
            <summary>🖼️ Voir les Images ({{ store.report.images.length }})</summary>
            <ul>
              <li v-for="(img, i) in store.report.images" :key="i">
                {{ img.filename }} → {{ img.assetName }} <em>#{{ img.docId }}</em>
              </li>
            </ul>
          </details>
        </div>
      </section>
    </transition>

    <!-- ===== RAPPORT ÉCHEC ===== -->
    <transition name="slide">
      <section v-if="store.report && store.phase === 'error' && store.report.rollbackDone" class="failure-section">
        <div class="failure-banner">
          <div class="failure-icon-wrap">
            <span class="failure-icon">💥</span>
          </div>
          <div>
            <h2>Import annulé</h2>
            <p>Une erreur est survenue. <strong>Aucune donnée n'a été conservée.</strong></p>
          </div>
        </div>

        <div class="failure-details">
          <div class="failure-item">
            <span class="failure-label">📁 Fichier</span>
            <span class="failure-value">{{ store.report.failedFile }}</span>
          </div>
          <div class="failure-item" v-if="store.report.failedLine">
            <span class="failure-label">📍 Ligne</span>
            <span class="failure-value">{{ store.report.failedLine }}</span>
          </div>
          <div class="failure-item">
            <span class="failure-label">💬 Message</span>
            <code class="failure-code">{{ store.report.errorMessage }}</code>
          </div>
        </div>

        <details v-if="store.report.failedRow" class="failure-raw">
          <summary>📋 Voir la ligne en erreur</summary>
          <pre>{{ JSON.stringify(store.report.failedRow, null, 2) }}</pre>
        </details>
      </section>
    </transition>

    <!-- ===== LOGS ===== -->
    <section v-if="store.debugLogs.length > 0" class="logs-section">
      <div class="logs-header">
        <h3>
          <span class="logs-icon">📡</span>
          Console temps réel
          <span class="logs-count">{{ store.debugLogs.length }}</span>
        </h3>
        <button class="logs-toggle" @click="showLogs = !showLogs">
          {{ showLogs ? '↑ Masquer' : '↓ Afficher' }}
        </button>
      </div>

      <transition name="fade">
        <div v-if="showLogs" class="logs-terminal">
          <div
            v-for="(log, i) in store.debugLogs"
            :key="i"
            class="log-line"
            :class="`log-${log.type}`"
          >
            <span class="log-prompt">$</span>
            <span class="log-time">{{ log.time }}</span>
            <span class="log-msg">{{ log.message }}</span>
            <details v-if="log.data" class="log-extra">
              <summary>+</summary>
              <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </transition>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGlobalImportStore } from '@/stores/globalImportStore'

const store    = useGlobalImportStore()
const showLogs = ref(true)

function handleAssetsFile(e) {
  const file = e.target.files[0]
  store.setAssetsFile(file)
}

function handleTicketsFile(e) {
  const file = e.target.files[0]
  store.setTicketsFile(file)
}

function handleCostsFile(e) {
  const file = e.target.files[0]
  store.setCostsFile(file)
}

function handleImagesFile(e) {
  const file = e.target.files[0]
  store.setImagesFile(file)
}

const canImport = computed(() => {
  return store.assetsData.rows.length > 0 ||
         store.ticketsData.rows.length > 0 ||
         store.costsData.rows.length > 0 ||
         store.imagesFile
})

const progressPercent = computed(() => {
  if (store.progress.total === 0) return 0
  return Math.round((store.progress.current / store.progress.total) * 100)
})

const totalLines = computed(() => {
  return store.assetsData.rows.length +
         store.ticketsData.rows.length +
         store.costsData.rows.length
})

const currentStep = computed(() => {
  if (store.phase === 'done' || (store.phase === 'error' && store.report)) return 3
  if (store.phase === 'importing') return 2
  if (canImport.value) return 2
  return 1
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT GLOBAL
═══════════════════════════════════════════════ */
.import-view {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ═══════════════════════════════════════════════
   HERO HEADER avec dégradé violet
═══════════════════════════════════════════════ */
.hero-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 35px 40px;
  margin-bottom: 25px;
  color: #fff;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(40px);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1;
}

.hero-icon {
  font-size: 50px;
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.hero-header h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 700;
}

.hero-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.hero-stats {
  z-index: 1;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}

.stat-lbl {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 5px;
}

/* ═══════════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════════ */
.steps-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.step-item.active { opacity: 1; }
.step-item.done { opacity: 1; }

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #6b7280;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.step-item.done .step-circle {
  background: #10b981;
  color: #fff;
}

.step-item.done .step-circle::after {
  content: '✓';
  position: absolute;
}

.step-item span {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 15px;
  margin-top: -20px;
}

/* ═══════════════════════════════════════════════
   SECTIONS
═══════════════════════════════════════════════ */
.section-block {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.section-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #6b7280;
}

.section-header h2 {
  margin: 0 0 3px 0;
  font-size: 19px;
  color: #1a1a2e;
}

.section-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* ═══════════════════════════════════════════════
   FILES GRID — TUILES COLORÉES
═══════════════════════════════════════════════ */
.files-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.file-tile {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #fafbfc;
  border: 2px solid transparent;
  border-radius: 14px;
  transition: all 0.3s;
}

.file-tile.loaded {
  background: #f0fdf4;
  border-color: #10b981;
}

.file-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.tile-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tile-icon-wrap.purple { background: linear-gradient(135deg, #a78bfa, #7c3aed); }
.tile-icon-wrap.blue   { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.tile-icon-wrap.orange { background: linear-gradient(135deg, #fb923c, #ea580c); }
.tile-icon-wrap.green  { background: linear-gradient(135deg, #34d399, #059669); }

.tile-icon {
  font-size: 28px;
}

.tile-body {
  flex: 1;
  min-width: 0;
}

.tile-body h3 {
  margin: 0 0 3px 0;
  font-size: 15px;
  color: #1a1a2e;
}

.tile-body p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #6b7280;
}

.file-btn {
  display: block;
  padding: 8px 14px;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  color: #475569;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-btn:hover {
  background: #f0f9ff;
  border-color: #667eea;
  color: #667eea;
}

.tile-badge {
  margin-top: 10px;
  font-size: 11px;
  padding: 4px 10px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 100px;
  font-weight: 600;
  display: inline-block;
}

/* ═══════════════════════════════════════════════
   BOUTONS D'ACTION
═══════════════════════════════════════════════ */
.action-block {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.action-block .section-header h2 {
  color: #fff;
}

.action-block .section-header p {
  color: rgba(255,255,255,0.7);
}

.action-block .section-number {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-launch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transition: all 0.2s;
}

.btn-launch:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.5);
}

.btn-launch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 18px;
}

.btn-clear {
  padding: 14px 22px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}

.btn-clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hint-message {
  margin-top: 15px;
  padding: 10px 15px;
  background: rgba(255,255,255,0.05);
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

/* ═══════════════════════════════════════════════
   ERREURS
═══════════════════════════════════════════════ */
.error-section {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: 14px;
  padding: 20px 25px;
  margin-bottom: 20px;
  border-left: 4px solid #dc2626;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.error-icon {
  font-size: 24px;
}

.error-header h3 {
  margin: 0;
  color: #991b1b;
  font-size: 16px;
}

.error-list {
  margin: 0;
  padding-left: 30px;
  color: #7f1d1d;
  font-size: 13px;
}

.error-list li {
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════
   PROGRESSION
═══════════════════════════════════════════════ */
.progress-section {
  background: #fff;
  border-radius: 16px;
  padding: 25px 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
  border: 1px solid #e0e7ff;
}

.progress-header {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.loader {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e7ff;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-header h3 {
  margin: 0 0 3px 0;
  color: #1a1a2e;
  font-size: 16px;
}

.progress-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.progress-track {
  height: 30px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 100px;
  transition: width 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  min-width: 50px;
}

.progress-text {
  color: #fff;
  font-weight: 700;
  font-size: 12px;
}

.progress-info {
  text-align: center;
  margin-top: 10px;
  font-size: 13px;
  color: #6b7280;
}

/* ═══════════════════════════════════════════════
   SUCCÈS
═══════════════════════════════════════════════ */
.success-section {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
  border-top: 4px solid #10b981;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.success-icon-wrap {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.success-icon {
  font-size: 36px;
}

.success-banner h2 {
  margin: 0 0 5px 0;
  color: #1a1a2e;
  font-size: 22px;
}

.success-banner p {
  margin: 0;
  color: #6b7280;
}

.success-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 25px;
}

.success-stat {
  background: #fafbfc;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  gap: 15px;
  align-items: center;
  border-left: 4px solid;
}

.success-stat.purple { border-color: #7c3aed; }
.success-stat.blue   { border-color: #2563eb; }
.success-stat.orange { border-color: #ea580c; }
.success-stat.green  { border-color: #059669; }

.stat-icon {
  font-size: 28px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 3px;
}

.details-grid {
  display: grid;
  gap: 10px;
}

.detail-card {
  background: #fafbfc;
  border-radius: 10px;
  padding: 12px 18px;
}

.detail-card summary {
  cursor: pointer;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
  user-select: none;
}

.detail-card ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: #475569;
}

.detail-card li {
  padding: 4px 0;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
}

.sub-list {
  margin-top: 5px !important;
  color: #6b7280 !important;
  font-size: 12px !important;
}

em {
  color: #9ca3af;
  font-style: normal;
  font-size: 12px;
}

/* ═══════════════════════════════════════════════
   ÉCHEC
═══════════════════════════════════════════════ */
.failure-section {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  border-top: 4px solid #dc2626;
}

.failure-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.failure-icon-wrap {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
}

.failure-icon {
  font-size: 36px;
}

.failure-banner h2 {
  margin: 0 0 5px 0;
  color: #1a1a2e;
  font-size: 22px;
}

.failure-banner p {
  margin: 0;
  color: #6b7280;
}

.failure-details {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.failure-item {
  display: flex;
  gap: 15px;
  padding: 12px 18px;
  background: #fef2f2;
  border-radius: 10px;
}

.failure-label {
  font-weight: 700;
  color: #991b1b;
  min-width: 100px;
  font-size: 13px;
}

.failure-value {
  color: #1a1a2e;
  font-size: 13px;
}

.failure-code {
  background: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #dc2626;
  flex: 1;
}

.failure-raw {
  background: #fafbfc;
  border-radius: 10px;
  padding: 12px 18px;
}

.failure-raw summary {
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
}

.failure-raw pre {
  background: #1a1a2e;
  color: #34d399;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 12px;
  overflow-x: auto;
}

/* ═══════════════════════════════════════════════
   LOGS — STYLE TERMINAL
═══════════════════════════════════════════════ */
.logs-section {
  margin-top: 20px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1a2e;
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #2a2a3e;
}

.logs-header h3 {
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.logs-icon {
  font-size: 18px;
}

.logs-count {
  background: #667eea;
  color: #fff;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}

.logs-toggle {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}

.logs-terminal {
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'Courier New', 'Monaco', monospace;
  padding: 15px 20px;
  border-radius: 0 0 12px 12px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.7;
}

.log-line {
  padding: 4px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.log-prompt {
  color: #667eea;
  font-weight: 700;
}

.log-time {
  color: #6e7681;
  font-size: 10px;
}

.log-msg {
  flex: 1;
}

.log-info    .log-msg { color: #c9d1d9; }
.log-success .log-msg { color: #34d399; }
.log-error   .log-msg { color: #f87171; }
.log-warning .log-msg { color: #fbbf24; }

.log-extra {
  width: 100%;
  margin-top: 5px;
}

.log-extra summary {
  cursor: pointer;
  color: #667eea;
  font-size: 11px;
}

.log-extra pre {
  background: #161b22;
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
  font-size: 11px;
  color: #34d399;
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 900px) {
  .files-grid,
  .success-stats {
    grid-template-columns: 1fr;
  }

  .hero-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .hero-content {
    flex-direction: column;
  }
}
</style>