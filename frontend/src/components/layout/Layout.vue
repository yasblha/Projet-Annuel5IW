<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar :class="{ 'open': sidebarOpen }" />
    
    <!-- Main content area -->
    <div class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <!-- Navbar -->
      <Navbar />
      
      <!-- Page content -->
      <main class="page-content">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen" 
      @click="closeSidebar"
      class="mobile-overlay md:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Handle sidebar toggle from navbar
const handleSidebarToggle = () => {
  toggleSidebar()
}

onMounted(() => {
  window.addEventListener('toggle-sidebar', handleSidebarToggle)
})

onUnmounted(() => {
  window.removeEventListener('toggle-sidebar', handleSidebarToggle)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease-in-out;
}

.page-content {
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: calc(100vh - 64px); /* 64px = navbar height */
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 35;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-open {
    margin-left: 0;
  }
}
</style> 