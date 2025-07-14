<template>
  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="statusClasses">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'PENDING' | 'SIGNED' | 'REFUSED';
}>();

const statusClasses = computed(() => {
  switch (props.status) {
    case 'SIGNED':
      return 'bg-green-100 text-green-800';
    case 'REFUSED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
    default:
      return 'bg-amber-100 text-amber-800';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'SIGNED':
      return 'Signé';
    case 'REFUSED':
      return 'Refusé';
    case 'PENDING':
    default:
      return 'En attente';
  }
});
</script>
