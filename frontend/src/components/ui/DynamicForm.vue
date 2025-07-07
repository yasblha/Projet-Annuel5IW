<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- En-tête du formulaire -->
    <div v-if="config.title || config.description" class="mb-6">
      <h2 v-if="config.title" class="text-xl font-bold text-gray-900 mb-2">
        <i v-if="config.icon" :class="config.icon" class="mr-2 text-blue-600"></i>
        {{ config.title }}
      </h2>
      <p v-if="config.description" class="text-gray-600">{{ config.description }}</p>
    </div>

    <!-- Champs du formulaire -->
    <div :class="getFormLayout()">
      <template v-for="field in config.fields" :key="field.name">
        <div :class="getFieldLayout(field)">
          <!-- Label -->
          <label 
            v-if="field.label" 
            :for="field.name"
            class="block text-sm font-medium text-gray-700 mb-1"
            :class="{ 'text-red-600': hasError(field.name) }"
          >
            {{ field.label }}
            <span v-if="field.required" class="text-red-500 ml-1">*</span>
          </label>

          <!-- Champ de saisie -->
          <component 
            :is="getFieldComponent(field.type)"
            :id="field.name"
            v-model="formData[field.name]"
            v-bind="getFieldProps(field)"
            :class="getFieldClasses(field)"
            @blur="validateField(field.name)"
            @input="clearError(field.name)"
          />

          <!-- Message d'erreur -->
          <p v-if="hasError(field.name)" class="mt-1 text-sm text-red-600">
            {{ getError(field.name) }}
          </p>

          <!-- Aide -->
          <p v-if="field.help" class="mt-1 text-sm text-gray-500">
            {{ field.help }}
          </p>
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button 
        v-if="config.showReset"
        type="button" 
        @click="resetForm"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <i class="fas fa-undo mr-2"></i>
        {{ config.resetText || 'Réinitialiser' }}
      </button>
      <button 
        type="submit"
        :disabled="isSubmitting"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
        <i v-else-if="config.submitIcon" :class="config.submitIcon" class="mr-2"></i>
        {{ isSubmitting ? (config.submittingText || 'Envoi...') : (config.submitText || 'Envoyer') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// Types pour la configuration du formulaire
export interface FieldConfig {
  name: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
  help?: string
  options?: Array<{ label: string; value: any }>
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    custom?: (value: any) => boolean | string
    message?: string
  }
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  defaultValue?: any
  autocomplete?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'none'
  rows?: number
  step?: number
  min?: number | string
  max?: number | string
  multiple?: boolean
  autofocus?: boolean
  spellcheck?: boolean
  prefix?: string
  suffix?: string
  wrapperClass?: string
  inputClass?: string
  labelClass?: string
  errorClass?: string
  helpClass?: string
}

export interface FormConfig {
  title?: string
  description?: string
  icon?: string
  submitText?: string
  submitIcon?: string
  resetText?: string
  resetIcon?: string
  showReset?: boolean
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid'
  gridCols?: number
  fields: FieldConfig[]
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
  onReset?: () => void
  validateOnSubmit?: boolean
}

interface Props {
  config: FormConfig
  initialData?: Record<string, any>
  modelValue?: Record<string, any>
}

interface Emits {
  (e: 'submit', data: Record<string, any>): void
  (e: 'reset'): void
  (e: 'update:modelValue', data: Record<string, any>): void
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  modelValue: () => ({})
})

const emit = defineEmits<Emits>()

// État du formulaire
const formData = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)
const touched = reactive<Record<string, boolean>>({})

// Initialisation des données
watch(() => props.initialData, (newData) => {
  Object.assign(formData, newData)
}, { immediate: true, deep: true })

watch(() => props.modelValue, (newData) => {
  Object.assign(formData, newData)
}, { immediate: true, deep: true })

// Émission des changements
watch(formData, (newData) => {
  emit('update:modelValue', { ...newData })
}, { deep: true })

// Composants de champs
const fieldComponents = {
  text: 'input',
  email: 'input',
  password: 'input',
  number: 'input',
  tel: 'input',
  url: 'input',
  date: 'input',
  'datetime-local': 'input',
  time: 'input',
  textarea: 'textarea',
  select: 'select',
  checkbox: 'input',
  radio: 'input',
  file: 'input',
  hidden: 'input'
}

function getFieldComponent(type: string): string {
  return fieldComponents[type as keyof typeof fieldComponents] || 'input'
}

function getFieldProps(field: FieldConfig): Record<string, any> {
  const props: Record<string, any> = {
    type: field.type,
    placeholder: field.placeholder,
    required: field.required,
    disabled: field.disabled,
    readonly: field.readonly,
    autocomplete: field.autocomplete,
    step: field.step,
    min: field.min,
    max: field.max,
    accept: field.accept
  }

  // Props spécifiques au type
  switch (field.type) {
    case 'textarea':
      props.rows = field.rows || 3
      props.cols = field.cols
      break
    case 'select':
      props.multiple = field.multiple
      break
    case 'checkbox':
    case 'radio':
      props.checked = formData[field.name] === true
      break
  }

  return props
}

function getFieldClasses(field: FieldConfig): string {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  }
  
  let classes = baseClasses
  
  if (field.size) {
    classes = classes.replace('px-3 py-2', sizeClasses[field.size])
  }
  
  if (hasError(field.name)) {
    classes += ' border-red-300 focus:ring-red-500'
  } else {
    classes += ' border-gray-300'
  }
  
  if (field.disabled) {
    classes += ' bg-gray-100 cursor-not-allowed'
  }
  
  return classes
}

function getFormLayout(): string {
  const layout = props.config.layout || 'vertical'
  
  switch (layout) {
    case 'grid':
      const cols = props.config.gridCols || 2
      return `grid grid-cols-1 md:grid-cols-${cols} gap-4`
    case 'horizontal':
      return 'space-y-4'
    default:
      return 'space-y-4'
  }
}

function getFieldLayout(field: FieldConfig): string {
  if (props.config.layout === 'grid' && field.layout?.span) {
    return `col-span-${field.layout.span}`
  }
  return ''
}

// Validation
function validateField(fieldName: string): boolean {
  const field = props.config.fields.find(f => f.name === fieldName)
  if (!field) return true
  
  const value = formData[fieldName]
  touched[fieldName] = true
  
  // Validation requise
  if (field.required && (!value || value === '')) {
    errors[fieldName] = 'Ce champ est requis'
    return false
  }
  
  // Validation pattern
  if (field.validation?.pattern && value) {
    const regex = new RegExp(field.validation.pattern)
    if (!regex.test(value)) {
      errors[fieldName] = 'Format invalide'
      return false
    }
  }
  
  // Validation longueur
  if (field.validation?.minLength && value && value.length < field.validation.minLength) {
    errors[fieldName] = `Minimum ${field.validation.minLength} caractères`
    return false
  }
  
  if (field.validation?.maxLength && value && value.length > field.validation.maxLength) {
    errors[fieldName] = `Maximum ${field.validation.maxLength} caractères`
    return false
  }
  
  // Validation numérique
  if (field.validation?.min !== undefined && value && Number(value) < field.validation.min) {
    errors[fieldName] = `Valeur minimum : ${field.validation.min}`
    return false
  }
  
  if (field.validation?.max !== undefined && value && Number(value) > field.validation.max) {
    errors[fieldName] = `Valeur maximum : ${field.validation.max}`
    return false
  }
  
  // Validation personnalisée
  if (field.validation?.custom && value) {
    const customError = field.validation.custom(value)
    if (customError) {
      errors[fieldName] = customError
      return false
    }
  }
  
  // Si tout est OK, supprimer l'erreur
  delete errors[fieldName]
  return true
}

function validateForm(): boolean {
  let isValid = true
  
  props.config.fields.forEach(field => {
    if (!validateField(field.name)) {
      isValid = false
    }
  })
  
  return isValid
}

function hasError(fieldName: string): boolean {
  return !!errors[fieldName]
}

function getError(fieldName: string): string {
  return errors[fieldName] || ''
}

function clearError(fieldName: string): void {
  delete errors[fieldName]
}

// Actions
async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    emit('submit', { ...formData })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm(): void {
  Object.keys(formData).forEach(key => {
    formData[key] = props.initialData[key] || ''
  })
  
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
  
  Object.keys(touched).forEach(key => {
    delete touched[key]
  })
  
  emit('reset')
}
</script> 