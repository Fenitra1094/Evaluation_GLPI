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
import { useImportStore } from '@/stores/importStore'

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

<style scoped>
.import-view {
  padding: 30px;
  max-width: 1200px;
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

/* ===== UPLOAD ===== */
.upload-zone {
  border: 3px dashed #cbd5e1;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  background: #fff;
  transition: all 0.2s;
}
.upload-zone:hover {
  border-color: #0078d4;
  background: #f0f9ff;
}
.upload-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.upload-icon {
  font-size: 60px;
}
.upload-text strong {
  display: block;
  font-size: 18px;
  color: #1a1a2e;
}
.upload-text span {
  color: #6b7280;
  font-size: 14px;
}

/* ===== FILE INFO ===== */
.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.file-icon { font-size: 30px; }
.file-info strong { display: block; }
.file-info small { color: #6b7280; font-size: 12px; }
.btn-reset {
  margin-left: auto;
  background: #fee;
  color: #c00;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

/* ===== TABLE ===== */
.table-wrapper {
  background: #fff;
  border-radius: 10px;
  overflow-x: auto;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  max-height: 400px;
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  background: #f4f6f9;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
}
td {
  padding: 10px 12px;
  border-top: 1px solid #f0f0f0;
}

/* ===== ALERTS ===== */
.alert {
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.alert h3 { margin: 0 0 10px 0; }
.alert ul { margin: 0; padding-left: 20px; font-size: 13px; }
.alert-error    { background: #fef2f2; color: #991b1b; }
.alert-warning  { background: #fffbeb; color: #92400e; }
.alert-success  { background: #f0fdf4; color: #166534; }

/* ===== BUTTONS ===== */
.actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
}
.btn-primary {
  background: #0078d4;
  color: #fff;
}
.btn-primary:hover { background: #005a9e; }
.btn-secondary {
  background: #e5e7eb;
  color: #1a1a2e;
}
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== PROGRESS ===== */
.progress-section {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin-top: 20px;
}
.progress-bar {
  height: 10px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
  margin: 15px 0 8px 0;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0078d4, #00bcf2);
  transition: width 0.3s;
}

/* ===== REPORT ===== */
.report-section { margin-top: 20px; }

/* ===== ERROR DETAILS ===== */
.error-details {
  margin: 15px 0;
}
.error-box {
  background: #fff;
  border-left: 4px solid #dc2626;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 6px;
}
.error-box strong {
  display: block;
  margin-bottom: 5px;
  color: #1a1a2e;
}
.error-box code {
  background: #fee;
  padding: 4px 8px;
  border-radius: 4px;
  color: #c00;
  font-family: monospace;
}
.error-box pre {
  background: #f9fafb;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0 0 0;
}
.rollback-note {
  font-style: italic;
  color: #6b7280;
  text-align: center;
  margin-top: 15px;
}

/* ===== LOGS ===== */
.logs-section {
  background: #1a1a2e;
  color: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}
.logs-section h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 15px 0;
  color: #fff;
}
.btn-mini {
  background: #374151;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
}
.logs-container {
  max-height: 400px;
  overflow-y: auto;
  background: #0f0f1e;
  border-radius: 8px;
  padding: 10px;
}
.log-entry {
  padding: 6px 10px;
  font-family: monospace;
  font-size: 12px;
  border-bottom: 1px solid #2a2a3e;
  display: flex;
  flex-direction: column;
}
.log-time {
  color: #6b7280;
  font-size: 10px;
  margin-right: 10px;
}
.log-info    { color: #d1d5db; }
.log-success { color: #10b981; }
.log-error   { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.log-warning { color: #f59e0b; }

.log-data {
  margin-top: 5px;
  background: #2a2a3e;
  padding: 8px;
  border-radius: 4px;
}
.log-data summary {
  cursor: pointer;
  color: #9ca3af;
}
.log-data pre {
  margin: 8px 0 0 0;
  font-size: 11px;
  color: #fff;
} 
</style>