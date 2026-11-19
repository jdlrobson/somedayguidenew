<script setup>
import { ref } from 'vue'
const props = defineProps({
  src: String,
  href: String,
  size: String
});

const randomColor = () => {
  const r = Math.floor( Math.random() * 255 );
  const g = Math.floor( Math.random() * 255 );
  const b = Math.floor( Math.random() * 255 );
  return `rgb( ${r}, ${g}, ${b} )`;
}
const bgColor = ref(
  randomColor()
);
</script>

<template>
   <a v-if="href" :href="href" :class="`face face--${size}`">
        <img v-if="src" :src="src" loading="lazy">
        <div v-else :style="`background: ${bgColor}`"></div>
        <span><slot></slot>&nbsp;</span>
   </a>
   <span v-else class="face">
    <img :src="src" loading="lazy">
    <span><slot></slot></span>
   </span>
</template>

<style scoped>
.face {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;
    font-size: 0.75rem;
    color: #333;
}
a.face:hover {
  opacity: 0.8;
}
.face > div,
.face img {
    border-radius: 50%;
    width: 92px;
    height: 92px;
    margin: 10px 0;
}
.face.face--small > div,
.face.face--small img {
  width: 40px;
  height: 40px;
}
</style>
