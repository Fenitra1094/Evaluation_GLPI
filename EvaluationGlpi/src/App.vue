<template>
  <MainLayout />
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
</script>

<style>
/* Reset global appliqué à toute l'application */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f4f6f9;
  color: #1a1a2e;
}
</style>