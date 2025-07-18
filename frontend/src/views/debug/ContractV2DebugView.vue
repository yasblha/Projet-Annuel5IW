<template>
  <div class="debug-page">
    <div class="header bg-gray-800 text-white p-4 mb-6">
      <h1 class="text-2xl font-bold">Debugging Contract Service V2</h1>
      <p class="text-sm text-gray-300">Outil de diagnostic pour la communication avec le service contract-service-v2</p>
    </div>
    
    <div class="container mx-auto px-4">
      <ContractV2Debugger />
    </div>
  </div>
</template>

<script setup>
import ContractV2Debugger from '@/components/debug/ContractV2Debugger.vue';
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
