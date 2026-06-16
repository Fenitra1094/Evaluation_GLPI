<template>
  <div class="import-view">

    <header class="page-header">
      <h1>📥 Import CSV</h1>
      <p>Importez vos équipements depuis un fichier CSV</p>
    </header>

    <!-- ===== ZONE UPLOAD ===== -->
    <div v-if="store.phase === 'idle' && !store.file" class="upload-zone">
      <input
        type="file"
        id="csv-file"
        accept=".csv"
        @change="handleFileSelect"
        hidden
      />
      <label for="csv-file" class="upload-label">
        <div class="upload-icon">📂</div>
        <div class="upload-text">
          <strong>Cliquez pour sélectionner</strong>
          <span>ou glissez votre fichier CSV ici</span>
        </div>
      </label>
    </div>

    <!-- ===== APERÇU DU FICHIER ===== -->
    <div v-if="store.rows.length > 0" class="preview-section">

      <div class="file-info">
        <span class="file-icon">📄</span>
        <div>
          <strong>{{ store.file?.name }}</strong>
          <small>{{ store.rows.length }} lignes détectées</small>
        </div>
        <button class="btn-reset" @click="store.reset()">✕ Changer</button>
      </div>

      <!-- Tableau d'aperçu -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th v-for="h in store.headers" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in store.rows" :key="i">
              <td>{{ row._lineNumber }}</td>
              <td v-for="h in store.headers" :key="h">{{ row[h] || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== ERREURS ===== -->
      <div v-if="store.errors.length > 0" class="alert alert-error">
        <h3>❌ {{ store.errors.length }} erreur(s)</h3>
        <ul>
          <li v-for="(e, i) in store.errors" :key="i">{{ e }}</li>
        </ul>
      </div>

      <!-- ===== WARNINGS ===== -->
      <div v-if="store.warnings.length > 0" class="alert alert-warning">
        <h3>⚠️ {{ store.warnings.length }} avertissement(s)</h3>
        <ul>
          <li v-for="(w, i) in store.warnings" :key="i">{{ w }}</li>
        </ul>
      </div>

      <!-- ===== ACTIONS ===== -->
      <div class="actions">
        <button
          class="btn-secondary"
          @click="store.validate()"
          :disabled="store.phase === 'importing'"
        >
          🔍 Valider
        </button>
        <button
          class="btn-primary"
          @click="store.importAll()"
          :disabled="store.phase === 'importing'"
        >
          🚀 Importer ({{ store.rows.length }} lignes)
        </button>
      </div>
    </div>

    <!-- ===== PROGRESSION ===== -->
    <div v-if="store.phase === 'importing'" class="progress-section">
      <h3>⏳ Import en cours...</h3>
      <p>{{ store.progress.label }}</p>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      <small>{{ store.progress.current }} / {{ store.progress.total }}</small>
    </div>
<!-- ===== RAPPORT FINAL ===== -->
<div v-if="store.report" class="report-section">

  <!-- ✅ SUCCESS -->
  <div v-if="store.phase === 'done'" class="alert alert-success">
    <h2>✅ Import réussi !</h2>
    <p><strong>{{ store.report.success }}</strong> équipement(s) créé(s)</p>
    <ul>
      <li v-for="(d, i) in store.report.details" :key="i">
        Ligne {{ d.line }} — {{ d.type }} : {{ d.name }} (ID: {{ d.id }})
      </li>
    </ul>
  </div>

  <!-- ❌ ERREUR -->
  <div v-if="store.phase === 'error' && store.report.rollbackDone" class="alert alert-error">
    <h2>❌ Import échoué — Rollback effectué</h2>

    <div class="error-details">
      <div class="error-box">
        <strong>📍 Ligne en erreur :</strong> {{ store.report.failedLine }}
      </div>
      <div class="error-box">
        <strong>📦 Élément :</strong> {{ store.report.failedName }}
      </div>
      <div class="error-box">
        <strong>💥 Message :</strong>
        <code>{{ store.report.errorMessage }}</code>
      </div>

      <!-- Détails de la ligne -->
      <div class="error-box">
        <strong>📋 Détails de la ligne :</strong>
        <pre>{{ JSON.stringify(store.report.failedRow, null, 2) }}</pre>
      </div>
    </div>

    <p class="rollback-note">
      <em>Aucune donnée n'a été conservée dans GLPI.</em>
    </p>
  </div>

  <button class="btn-secondary" @click="store.reset()">
    Nouveau import
  </button>
</div>

    <!-- ===== LOGS DETAILLÉS ===== -->
    <div v-if="store.debugLogs.length > 0" class="logs-section">
    <h3>
        📋 Logs détaillés ({{ store.debugLogs.length }})
        <button class="btn-mini" @click="showLogs = !showLogs">
        {{ showLogs ? 'Masquer' : 'Afficher' }}
        </button>
    </h3>

    <div v-if="showLogs" class="logs-container">
        <div
        v-for="(log, i) in store.debugLogs"
        :key="i"
        class="log-entry"
        :class="`log-${log.type}`"
        >
        <span class="log-time">{{ log.time }}</span>
        <span class="log-message">{{ log.message }}</span>
        <details v-if="log.data" class="log-data">
            <summary>Détails</summary>
            <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
        </details>
        </div>
    </div>
    </div>
  </div>
</template>

<script setup>



// ... reste inchangé
import { computed, ref } from 'vue'
import { useImportStore } from '@/stores/importMvtStore'

const store = useImportStore()
const showLogs = ref(true)  // 🆕

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    store.loadFile(file)
  }
}

const progressPercent = computed(() => {
  if (store.progress.total === 0) return 0
  return Math.round((store.progress.current / store.progress.total) * 100)
})

</script>

<style scoped src="../styles/ImportView.css"></style>