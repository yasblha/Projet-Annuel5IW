<template>
  <form @submit.prevent="$emit('submit')" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="field in fields" :key="field.key">
        <label class="block font-medium mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500">*</span></label>
        <input
          v-if="field.type === 'text' || field.type === 'number' || field.type === 'date'"
          :type="field.type"
          :placeholder="field.placeholder || ''"
          :required="field.required"
          :disabled="field.disabled || readonly"
          class="form-input"
          v-model="localModel[field.key]"
        />
        <select
          v-else-if="field.type === 'select'"
          :required="field.required"
          :disabled="field.disabled || readonly"
          class="form-select"
          v-model="localModel[field.key]"
        >
          <option value="">--</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <div v-else-if="field.type === 'textarea'">
          <textarea :placeholder="field.placeholder || ''" :required="field.required" :disabled="field.disabled || readonly" class="form-input" v-model="localModel[field.key]" />
        </div>
        <!-- Ajoute d'autres types si besoin -->
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, reactive } from 'vue'

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: { value: string; label: string }[]
  disabled?: boolean
  placeholder?: string
}

const props = defineProps<{
  fields: FieldConfig[]
  modelValue?: Record<string, any>
  mode?: 'create' | 'edit' | 'view'
  readonly?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'submit'])

const localModel = reactive<Record<string, any>>({})

watch(() => props.modelValue, (val) => {
  if (val) Object.assign(localModel, val)
}, { immediate: true, deep: true })

watch(localModel, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })
</script>

<style scoped>
.form-input, .form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
  background: #f9fafb;
}
.form-input:focus, .form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #2563eb33;
  background: #fff;
}
</style> 