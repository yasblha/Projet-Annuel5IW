<template>
  <form @submit.prevent="onSearch" class="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
    <div v-for="field in fields" :key="field.name" class="flex flex-col min-w-[160px] flex-1 relative">
      <label :for="field.name" class="font-medium text-gray-700 mb-1">{{ field.label }}</label>
      <input
        v-if="field.type === 'text' || field.type === 'number' || field.type === 'date'"
        :type="field.type"
        :id="field.name"
        v-model="form[field.name]"
        :placeholder="field.placeholder || ''"
        class="form-input"
      />
      <select
        v-else-if="field.type === 'select'"
        :id="field.name"
        v-model="form[field.name]"
        class="form-select"
      >
        <option value="">--</option>
        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <div v-else-if="field.type === 'autocomplete'" class="relative">
        <input
          :id="field.name"
          v-model="form[field.name]"
          :placeholder="field.placeholder || ''"
          class="form-input"
          @input="onAutocompleteInput(field)"
          @focus="onAutocompleteInput(field)"
          autocomplete="off"
        />
        <ul v-if="suggestions[field.name] && suggestions[field.name].length > 0 && showSuggestions[field.name]" class="absolute z-10 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-48 overflow-auto">
          <li v-for="option in suggestions[field.name]" :key="option.value" class="px-3 py-2 hover:bg-blue-50 cursor-pointer" @mousedown.prevent="selectSuggestion(field, option)">
            {{ option.label }}
          </li>
        </ul>
      </div>
      <!-- Ajoute d'autres types si besoin -->
    </div>
    <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Rechercher</button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, defineProps, defineEmits } from 'vue'

interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'autocomplete'
  placeholder?: string
  options?: { value: string; label: string }[]
  fetchSuggestions?: (query: string) => Promise<{ value: string; label: string }[]>
}

const props = defineProps<{ fields: FieldConfig[] }>()
const emit = defineEmits(['search'])

const form = reactive<Record<string, any>>({})
const suggestions = reactive<Record<string, Array<{ value: string; label: string }>>>({})
const showSuggestions = reactive<Record<string, boolean>>({})

props.fields.forEach(field => {
  form[field.name] = ''
  suggestions[field.name] = []
  showSuggestions[field.name] = false
})

let debounceTimeout: any = null
function onAutocompleteInput(field: FieldConfig) {
  const query = form[field.name]
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    if (typeof field.fetchSuggestions === 'function' && query && query.length > 1) {
      suggestions[field.name] = await field.fetchSuggestions(query)
      showSuggestions[field.name] = true
    } else {
      suggestions[field.name] = []
      showSuggestions[field.name] = false
    }
  }, 250)
}
function selectSuggestion(field: FieldConfig, option: { value: string; label: string }) {
  form[field.name] = option.label
  showSuggestions[field.name] = false
  // On peut aussi émettre la value si besoin
}

function onSearch() {
  // N'émettre que les champs non vides
  const filters = Object.fromEntries(Object.entries(form).filter(([_, v]) => v !== ''))
  emit('search', filters)
}
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