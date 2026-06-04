<template>
  <form class="lc-form" @submit.prevent="handleSubmit">

    <h3 class="form-title">
      {{ isEdit ? '✏️ Modifier' : '➕ Nouvel ordinateur local' }}
    </h3>

    <div class="form-grid">
      <label class="field">
        <span>Nom *</span>
        <input v-model="form.name" type="text" required />
      </label>

      <label class="field">
        <span>Numéro de série</span>
        <input v-model="form.serial" type="text" />
      </label>

      <label class="field">
        <span>Tag personnalisé</span>
        <input v-model="form.customTag" type="text" placeholder="ex: perso, client X..." />
      </label>

      <label class="field">
        <span>Priorité (1-5)</span>
        <select v-model.number="form.priority">
          <option :value="null">-- Sélectionner --</option>
          <option :value="1">1 - Faible</option>
          <option :value="2">2 - Basse</option>
          <option :value="3">3 - Moyenne</option>
          <option :value="4">4 - Haute</option>
          <option :value="5">5 - Critique</option>
        </select>
      </label>

      <label class="field field-full">
        <span>Note personnelle</span>
        <textarea v-model="form.localNote" rows="3"></textarea>
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="btn" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary" :disabled="saving">
        {{ saving ? '...' : (isEdit ? 'Modifier' : 'Créer') }}
      </button>
    </div>

  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  saving:      { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.initialData?.id)

const form = ref(getEmptyForm())

function getEmptyForm() {
  return {
    name: '',
    serial: '',
    customTag: '',
    priority: null,
    localNote: '',
  }
}

watch(() => props.initialData, (val) => {
  if (val) {
    form.value = {
      name:       val.name      || '',
      serial:     val.serial    || '',
      customTag:  val.customTag || '',
      priority:   val.priority  || null,
      localNote:  val.localNote || '',
    }
  } else {
    form.value = getEmptyForm()
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.lc-form {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  margin-bottom: 20px;
}
.form-title {
  font-size: 16px;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-full { grid-column: 1 / -1; }
.field span {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
.field input,
.field select,
.field textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color .15s;
  font-family: inherit;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #0078d4;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.btn-primary {
  background: #0078d4;
  color: #fff;
  border-color: #0078d4;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>