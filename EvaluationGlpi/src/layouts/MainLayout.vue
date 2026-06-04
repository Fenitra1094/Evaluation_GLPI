<template>
  <div class="app-layout">

    <!-- ===== SIDEBAR ===== -->
    <AppSidebar />

    <!-- ===== MAIN CONTENT ===== -->
    <main class="main-content">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  background: #f4f6f9;
}
</style>