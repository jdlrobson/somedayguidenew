<script setup>
import NavHeader from './components/NavHeader.vue'
</script>

<template>
  <div class="someday-app">
    <NavHeader></NavHeader>
    <RouterView :key="$route.fullPath" />
  </div>
</template>

<style scoped>
</style>
