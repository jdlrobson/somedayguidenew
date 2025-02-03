<script setup>
import ImageCircle from './ImageCircle.vue';
import jon from './jon.png';
import linz from './linz.jpg';
const props = defineProps({
  name: String,
  href: String,
  size: String
});

let src;
switch ( props.name ) {
    case 'jon':
        src = jon;
        break;
    case 'linz':
        src = linz;
        break;
}
</script>

<template>
    <ImageCircle :src="src" :href="href" :size="size">
        <slot />
    </ImageCircle>
</template>

<style scoped>

</style>
