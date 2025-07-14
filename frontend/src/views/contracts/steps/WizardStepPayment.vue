<template>
  <div class="step-container">
    <h2>Paiement</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- RIB -->
      <div>
        <label class="block mb-2 font-medium" for="rib">RIB *</label>
        <input id="rib" v-model="rib" type="text" placeholder="FR76 3000 6000 ..." class="w-full border rounded px-3 py-2" required />
      </div>

      <!-- Mode de paiement -->
      <div>
        <label class="block mb-2 font-medium" for="mode">Mode de paiement *</label>
        <select id="mode" v-model="mode" class="w-full border rounded px-3 py-2" required>
          <option value="PRELEVEMENT">Prélèvement automatique</option>
          <option value="CARTE">Carte bancaire</option>
          <option value="CHEQUE">Chèque</option>
        </select>
      </div>

      <div class="flex justify-between pt-6">
        <button type="button" class="btn" @click="$emit('previous')">Précédent</button>
        <button type="submit" class="btn-primary">Suivant</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  formData: any
}
const props = defineProps<Props>()
const emit = defineEmits(['update:formData', 'next', 'previous'])

const rib = ref<string>(props.formData?.payment?.rib ?? '')
const mode = ref<string>(props.formData?.payment?.mode ?? 'PRELEVEMENT')

const handleSubmit = () => {
  emit('update:formData', {
    payment: {
      rib: rib.value,
      mode: mode.value
    }
  })
  emit('next')
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 rounded bg-white text-sm;
}
.btn-primary {
  @apply inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700;
}
</style>
