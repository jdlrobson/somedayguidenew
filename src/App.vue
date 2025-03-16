<script setup>
import { ref } from 'vue'
import NavHeader from './components/NavHeader.vue'

let editModeEnabled = ref( localStorage.getItem('editmode') );
const appClass = {
  'someday-app': true,
  'someday-readonly': !editModeEnabled.value
}

const enableEditMode = () => {
  editModeEnabled.value = true;
  localStorage.setItem('editmode', true)
};
</script>

<template>
  <div :class="appClass">
    <NavHeader></NavHeader>
    <RouterView :key="$route.fullPath" />
    <a v-if="!editModeEnabled" role="button" @click="enableEditMode">Enable edit mode</a>
  </div>
</template>

<style>
.someday-readonly .snipLink,
.someday-readonly .editLink {
  display: none !important;
}
</style>
