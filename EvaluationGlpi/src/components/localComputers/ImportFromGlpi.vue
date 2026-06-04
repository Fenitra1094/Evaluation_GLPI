<template>
  <div class="import-box">
    <h3>📥 Importer depuis GLPI</h3>

    <div v-if="loading" class="loading">Chargement des ordinateurs GLPI...</div>

    <div v-else class="import-form">
      <select v-model="selectedId" class="select">
        <option :value="null">-- Sélectionner un ordinateur GLPI --</option>
        <option v-for="c in glpiComputers" :key="c.id" :value="c.id">
          [{{ c.id }}] {{ c.name }} ({{ c.serial || 'sans série' }})
        </option>
      </select>

      <button
        class="btn btn-primary"
        :disabled="!selectedId || importing"
        @click="doImport"
      >
        {{ importing ? '...' : '📥 Importer' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocalComputerStore } from '@/stores/localComputerStore'

const store = useLocalComputerStore()

const glpiComputers = ref([])
const selectedId    = ref(null)
const loading       = ref(false)
const importing     = ref(false)

const emit = defineEmits(['imported'])

onMounted(async () => {
  loading.value = true
  try {
    glpiComputers.value = await store.getGlpiComputers()
  } catch (e) {
    console.error('Erreur GLPI', e)
  } finally {
    loading.value = false
  }
})

async function doImport() {
  if (!selectedId.value) return
  importing.value = true
  try {
    await store.importFromGlpi(selectedId.value)
    emit('imported')
    selectedId.value = null
  } catch (e) {
    alert('Erreur lors de l\'import : ' + (store.error || e.message))
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.import-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.import-box h3 {
  font-size: 15px;
  color: #1e40af;
  margin-bottom: 12px;
}
.loading {
  color: #6b7280;
  font-size: 13px;
}
.import-form {
  display: flex;
  gap: 10px;
}
.select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.btn-primary {
  background: #1e40af;
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>