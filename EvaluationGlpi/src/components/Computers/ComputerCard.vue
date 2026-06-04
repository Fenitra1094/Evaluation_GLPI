<template>
  <div class="computer-card" @click="$emit('select', computer.id)">

    <div class="card-header">
      <span class="computer-icon">🖥️</span>
      <h3 class="computer-name">{{ computer.name || 'Sans nom' }}</h3>
      <span :class="['badge', statusClass]">
        {{ computer.states_id ?? 'N/A' }}
      </span>
    </div>

    <div class="card-body">
      <div class="info-row">
        <span class="label">ID</span>
        <span class="value"># {{ computer.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">Numéro de série</span>
        <span class="value">{{ computer.serial || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">Autre série</span>
        <span class="value">{{ computer.otherserial || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">Entité</span>
        <span class="value">{{ computer.entities_id || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">Commentaire</span>
        <span class="value">{{ computer.comment || '-' }}</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="date">
        Modifié le : {{ formatDate(computer.date_mod) }}
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  computer: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const statusClass = computed(() => {
  const statusId = props.computer.states_id

  if (statusId === 1) return 'badge-success'
  if (statusId === 2) return 'badge-warning'
  if (statusId === 3) return 'badge-danger'

  return 'badge-default'
})
</script>

<style scoped>
.computer-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
  padding: 16px;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  border: 1px solid #e5e7eb;
}
.computer-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,.15);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.computer-icon { font-size: 24px; }
.computer-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-success { background:#d1fae5; color:#065f46; }
.badge-warning  { background:#fef3c7; color:#92400e; }
.badge-danger   { background:#fee2e2; color:#991b1b; }
.badge-default  { background:#e5e7eb; color:#374151; }

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px dashed #f3f4f6;
}
.label { color: #6b7280; font-weight: 500; }
.value { color: #111827; font-weight: 400; }

.card-footer {
  margin-top: 12px;
  font-size: 11px;
  color: #9ca3af;
  text-align: right;
}
</style>