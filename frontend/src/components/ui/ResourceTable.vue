<template>
  <div class="bg-white rounded-xl shadow-lg overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 text-base">
      <thead class="bg-blue-50">
        <tr>
          <th v-for="col in columns" :key="col.key" class="px-8 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
            {{ col.label }}
          </th>
          <th v-if="actions && actions.length" class="px-8 py-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="row in data" :key="row.id" class="hover:bg-blue-50 transition">
          <td v-for="col in columns" :key="col.key" class="px-8 py-4">
            <span v-if="col.render">{{ col.render(row) }}</span>
            <span v-else>{{ row[col.key] }}</span>
          </td>
          <td v-if="actions && actions.length" class="px-8 py-4 text-center">
            <button v-for="action in actions" :key="action.label" class="mx-1 text-blue-600 hover:text-blue-900 transition" @click="() => action.handler(row)">
              <i :class="action.icon"></i>
            </button>
          </td>
        </tr>
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length + (actions && actions.length ? 1 : 0)" class="text-center text-gray-400 py-8">Aucune donnée trouvée.</td>
        </tr>
      </tbody>
    </table>
    <div v-if="pagination" class="flex justify-between items-center mt-6">
      <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="onPrevPage" :disabled="pagination.page === 1">Page précédente</button>
      <span class="mx-4">Page {{ pagination.page }}</span>
      <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="onNextPage" :disabled="data.length < pagination.pageSize">Page suivante</button>
      <span v-if="pagination.total">({{ pagination.total }} au total)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface ColumnConfig {
  key: string
  label: string
  render?: (row: any) => string
}
interface ActionConfig {
  icon: string
  label: string
  handler: (row: any) => void
}
interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

const props = defineProps<{
  columns: ColumnConfig[]
  data: any[]
  actions?: ActionConfig[]
  pagination?: PaginationConfig
}>()

function onPrevPage() {
  if (props.pagination && props.pagination.page > 1) {
    props.pagination.onPageChange(props.pagination.page - 1)
  }
}
function onNextPage() {
  if (props.pagination && props.data.length >= props.pagination.pageSize) {
    props.pagination.onPageChange(props.pagination.page + 1)
  }
}
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}
</style> 