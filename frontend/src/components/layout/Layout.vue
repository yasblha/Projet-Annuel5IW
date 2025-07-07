<template>
  <div class="layout">
    <Sidebar class="sidebar-fixed" />
    <div class="main-content">
      <Navbar class="navbar-sticky" />

      <main class="page-content">
        <slot />
      </main>
    </div>

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

.sidebar-fixed {
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  z-index: 40;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar-sticky {
  position: sticky;
  top: 0;
  z-index: 30;
}

.page-content {
  flex: 1;
  overflow-y: auto;

  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: calc(100vh - 64px); /* 64px = navbar height */
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-fixed {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  .sidebar-fixed.open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0;
  }

}
</style> 