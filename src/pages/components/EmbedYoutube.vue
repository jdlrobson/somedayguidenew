<script setup>
const props = defineProps({
  src: String
});
</script>
<template>
    <iframe width="400" height="280"
        :src="src"
        title="YouTube video player" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
    </iframe>
</template>
