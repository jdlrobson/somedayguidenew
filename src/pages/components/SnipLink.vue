<script setup>
const props = defineProps({
    href: String
})
</script>

<template>  
    <a target="_blank" :href="href" class="snipLink">
        ✂ Add snippet
    </a>
</template>

<style scoped>
.snipLink {
    background: black;
    display: inline-block;
    padding: 8px;
    color: white;
    margin: 10px 0 0;
    justify-content: end;
    justify-self: end;
    display: flex;
}
</style>
