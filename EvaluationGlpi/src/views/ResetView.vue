<template>
  <div class="reset-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <h1>🗑️ Réinitialisation des ressources GLPI</h1>
      <p class="subtitle">
        Cette page permet de purger les ressources GLPI via l'API.
        Les ressources sont découvertes dynamiquement via le schéma OpenAPI.
      </p>
    </header>

    <!-- ===== CHARGEMENT INITIAL ===== -->
    <div v-if="store.loading" class="state-box">
      <div class="spinner"></div>
      <p>Découverte des ressources GLPI...</p>
    </div>

    <!-- ===== EN COURS DE TRAITEMENT ===== -->
    <div v-else-if="store.processing" class="processing-box">
      <div class="spinner"></div>
      <h3>⏳ Suppression en cours...</h3>
      <p v-if="store.progress">
        <strong>{{ store.progress.label }}</strong> :
        {{ store.progress.current }} / {{ store.progress.total }}
      </p>
      <div class="progress-bar" v-if="store.progress">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- ===== CONTENU PRINCIPAL ===== -->
    <template v-else>

      <!-- RAPPORT DE LA DERNIÈRE OPÉRATION -->
      <div v-if="store.lastReport" class="report-box">
        <h3>✅ Rapport de réinitialisation</h3>
        <p class="report-summary">
          Supprimés : <strong>{{ store.lastReport.totalSuccess }}</strong> |
          Échecs : <strong>{{ store.lastReport.totalFailed }}</strong>
        </p>
        <ul>
          <li v-for="d in store.lastReport.details" :key="d.resource">
            {{ d.label }} : {{ d.success }}/{{ d.total }} supprimés
            <span v-if="d.failed > 0" class="error-text">
              ({{ d.failed }} échecs)
            </span>
          </li>
        </ul>
      </div>

      <!-- ZONE 1 : SUPPRESSION SÉLECTIVE -->
      <section class="zone zone-selective">
        <div class="zone-header">
          <h2>📋 Suppression sélective</h2>
          <span class="badge-count">
            {{ store.totalElements }} éléments au total
          </span>
        </div>

        <div class="actions-bar">
          <button class="btn btn-sm" @click="store.toggleAll(true)">
            ☑️ Tout cocher
          </button>
          <button class="btn btn-sm" @click="store.toggleAll(false)">
            ☐ Tout décocher
          </button>
          <button class="btn btn-sm" @click="store.loadResources()">
            🔄 Actualiser
          </button>
        </div>

        <div
          v-for="(items, category) in store.groupedByCategory"
          :key="category"
          class="category-block"
        >
          <h3 class="category-title">{{ category }}</h3>
          <div class="resources-grid">
            <label
              v-for="r in items"
              :key="r.key"
              class="resource-item"
              :class="{ disabled: r.count === 0 }"
            >
              <input
                type="checkbox"
                v-model="r.selected"
                :disabled="r.count === 0"
              />
              <div class="resource-info">
                <span class="resource-label">{{ r.label }}</span>
                <span class="resource-key">{{ r.key }}</span>
              </div>
              <span
                class="resource-count"
                :class="{ 'count-zero': r.count === 0 }"
              >
                <span v-if="r.loading">...</span>
                <span v-else>{{ r.count }}</span>
              </span>
            </label>
          </div>
        </div>

        <div class="zone-footer">
          <button
            class="btn btn-danger"
            :disabled="!store.hasSelection"
            @click="confirmPurgeSelected"
          >
            🗑️ Supprimer la sélection
            ({{ store.selectedResources.length }} ressource(s))
          </button>
        </div>
      </section>

      <!-- ZONE 2 : RÉINITIALISATION TOTALE -->
      <section class="zone zone-total">
        <div class="zone-header">
          <h2>⚠️ Réinitialisation totale</h2>
        </div>
        <p class="warning-text">
          Supprime <strong>TOUS</strong> les éléments de
          <strong>TOUTES</strong> les ressources listées ci-dessus.
          <br>
          Les ressources protégées (utilisateurs, profils, config, etc.) ne sont pas touchées.
        </p>
        <button class="btn btn-danger btn-large" @click="confirmPurgeAll">
          ⚠️ TOUT RÉINITIALISER
        </button>
      </section>

    </template>

    <!-- ===== ERREUR ===== -->
    <div v-if="store.error" class="error-box">
      ❌ {{ store.error }}
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useResetStore } from '@/stores/resetStore'

const store = useResetStore()

const progressPercent = computed(() => {
  if (!store.progress) return 0
  return Math.round((store.progress.current / store.progress.total) * 100)
})

onMounted(() => {
  store.loadResources()
})

function confirmPurgeSelected() {
  const total = store.selectedResources
    .reduce((sum, r) => sum + r.count, 0)

  const list = store.selectedResources
    .map(r => `• ${r.label} (${r.count})`)
    .join('\n')

  const ok = confirm(
    `⚠️ Confirmer la suppression de ${total} éléments ?\n\n` +
    `Ressources sélectionnées :\n${list}\n\n` +
    `Cette action est IRRÉVERSIBLE.`
  )
  if (ok) store.purgeSelected()
}

function confirmPurgeAll() {
  const ok = confirm(
    `⚠️⚠️⚠️ RÉINITIALISATION TOTALE ⚠️⚠️⚠️\n\n` +
    `Vous allez supprimer ${store.totalElements} éléments\n` +
    `dans ${store.resources.length} ressources.\n\n` +
    `Cette action est IRRÉVERSIBLE.\n\n` +
    `Confirmer ?`
  )
  if (ok) store.purgeAll()
}
</script>

<style scoped>
.reset-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== HEADER ===== */
.page-header {
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 24px;
  color: #1a1a2e;
}
.subtitle {
  color: #6b7280;
  margin-top: 6px;
  font-size: 14px;
}

/* ===== ZONES ===== */
.zone {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 10px;
}
.zone-header h2 {
  font-size: 18px;
  color: #1a1a2e;
}
.badge-count {
  background: #0078d4;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.actions-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* ===== CATÉGORIES ===== */
.category-block {
  margin-bottom: 18px;
}
.category-title {
  font-size: 13px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;
}
.resource-item:hover:not(.disabled) {
  background: #eef2ff;
  border-color: #0078d4;
}
.resource-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.resource-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.resource-label {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}
.resource-key {
  font-size: 10px;
  color: #9ca3af;
  font-family: monospace;
}
.resource-count {
  background: #0078d4;
  color: #fff;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}
.count-zero {
  background: #d1d5db;
  color: #6b7280;
}

.zone-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

/* ===== ZONE RESET TOTAL ===== */
.zone-total {
  background: #fff7ed;
  border-left: 4px solid #f97316;
}
.warning-text {
  color: #7c2d12;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* ===== BOUTONS ===== */
.btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all .15s;
}
.btn:hover { background: #f3f4f6; }
.btn-sm { font-size: 12px; padding: 6px 12px; }
.btn-danger {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
  font-weight: 600;
}
.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}
.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-large {
  padding: 14px 28px;
  font-size: 15px;
}

/* ===== ÉTATS ===== */
.state-box {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #0078d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.processing-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 30px;
  text-align: center;
  border-radius: 12px;
  margin-bottom: 24px;
}
.processing-box h3 {
  margin: 10px 0;
  color: #78350f;
}
.progress-bar {
  margin-top: 14px;
  background: #fef3c7;
  border-radius: 20px;
  overflow: hidden;
  height: 12px;
}
.progress-fill {
  background: #f59e0b;
  height: 100%;
  transition: width .3s ease;
}

/* ===== RAPPORT ===== */
.report-box {
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}
.report-box h3 {
  color: #14532d;
  margin-bottom: 8px;
}
.report-summary {
  color: #166534;
  margin-bottom: 10px;
}
.report-box ul {
  margin-top: 10px;
  padding-left: 20px;
}
.report-box li {
  font-size: 13px;
  color: #166534;
  margin: 4px 0;
}
.error-text {
  color: #dc2626;
  font-weight: 600;
}

.error-box {
  background: #fef2f2;
  border-left: 4px solid #dc2626;
  padding: 16px;
  border-radius: 8px;
  color: #991b1b;
  margin-top: 20px;
}
</style>