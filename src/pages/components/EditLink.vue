<script setup>
const props = defineProps({
    href: String
})
</script>

<template>  
    <a v-if="href" :href="href" class="editLink">edit</a>
</template>

<style scoped>
.editLink {
    position: absolute;
    top: 8px;
    right: 8px;
    color: gray;
    z-index: 2000;
}
</style>
