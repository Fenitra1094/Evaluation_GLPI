<template>
  <div class="reset-view">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <h1>🗑️ Réinitialisation</h1>
      <p>Supprimer toutes les données de GLPI (sauf système)</p>
    </header>

    <!-- ===== LOADING INITIAL ===== -->
    <div v-if="store.loading" class="loading-card">
      <div class="spinner"></div>
      <p>Chargement des ressources GLPI...</p>
    </div>

    <!-- ===== CARTE PRINCIPALE ===== -->
    <div v-else-if="!store.processing && !store.lastReport" class="main-card">

      <!-- Stats -->
      <div class="stats">
        <div class="stat-box">
          <span class="stat-number">{{ totalElements }}</span>
          <span class="stat-label">Éléments au total</span>
        </div>
      </div>

      <!-- Warning -->
      <div class="warning-box">
        <h3>⚠️ Attention</h3>
        <ul>
          <li>Cette action est <strong>irréversible</strong></li>
          <li>Toutes les données utilisateurs seront supprimées</li>
          <!-- <li>Les utilisateurs système (<code>glpi</code>, <code>glpi-system</code>) sont protégés</li> -->
        </ul>
      </div>

      <!-- Bouton principal -->
      <div class="actions">
        <button
          class="btn-danger"
          @click="confirmReset"
          :disabled="store.resources.length === 0"
        >
          🚨 Tout réinitialiser
        </button>
      </div>

    </div>

    <!-- ===== PROCESSING ===== -->
    <div v-if="store.processing" class="processing-card">
      <h2>⏳ Réinitialisation en cours...</h2>
      <p v-if="store.progress">
        <strong>{{ store.progress.label }}</strong><br>
        {{ store.progress.current }} / {{ store.progress.total }}
      </p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- ===== RAPPORT ===== -->
    <div v-if="store.lastReport && !store.processing" class="report-card">
      <h2>✅ Réinitialisation terminée</h2>

      <div class="report-stats">
        <div class="report-stat success">
          <span class="big">{{ store.lastReport.totalSuccess }}</span>
          <span>éléments supprimés</span>
        </div>
        <div class="report-stat error" v-if="store.lastReport.totalFailed > 0">
          <span class="big">{{ store.lastReport.totalFailed }}</span>
          <span>échecs</span>
        </div>
      </div>

      <button class="btn-secondary" @click="store.loadResources()">
        🔄 Actualiser
      </button>
    </div>

    <!-- ===== ERREUR ===== -->
    <div v-if="store.error" class="alert alert-error">
      <strong>❌ Erreur :</strong> {{ store.error }}
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useResetStore } from '@/stores/resetStore'

const store = useResetStore()

onMounted(() => {
  store.loadResources()
})

const totalElements = computed(() =>
  store.resources.reduce((sum, r) => sum + (r.count || 0), 0)
)

const progressPercent = computed(() => {
  if (!store.progress || store.progress.total === 0) return 0
  return Math.round((store.progress.current / store.progress.total) * 100)
})

function confirmReset() {
  const ok = confirm(
    '⚠️ ATTENTION\n\n' +
    'Cette action va supprimer TOUTES les données GLPI.\n' +
    `${totalElements.value} éléments seront détruits.\n\n` +
    'Êtes-vous sûr de continuer ?'
  )
  if (ok) {
    store.purgeAll()
  }
}
</script>

<style scoped>
.reset-view {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header h1 {
  margin: 0 0 5px 0;
  color: #1a1a2e;
}
.page-header p {
  color: #6b7280;
  margin: 0 0 30px 0;
}

/* ===== LOADING ===== */
.loading-card {
  background: #fff;
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #0078d4;
  border-radius: 50%;
  margin: 0 auto 15px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== MAIN CARD ===== */
.main-card {
  background: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* ===== STATS ===== */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
.stat-box {
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  color: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}
.stat-number {
  display: block;
  font-size: 42px;
  font-weight: 700;
}
.stat-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

/* ===== WARNING ===== */
.warning-box {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}
.warning-box h3 {
  margin: 0 0 10px 0;
  color: #92400e;
}
.warning-box ul {
  margin: 0;
  padding-left: 20px;
  color: #92400e;
}
.warning-box code {
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* ===== BUTTONS ===== */
.actions {
  display: flex;
  justify-content: center;
}
.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: #fff;
  border: none;
  padding: 18px 50px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.5);
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  background: #e5e7eb;
  color: #1a1a2e;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* ===== PROCESSING ===== */
.processing-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
}
</style>