<script setup>
const props = defineProps({
  src: String,
  href: String,
  size: String
});
</script>

<template>
   <a v-if="href" :href="href" :class="`face face--${size}`">
        <img :src="src">
        <span><slot></slot>&nbsp;</span>
   </a>
   <span v-else class="face">
    <img :src="src">
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
.face img {
    border-radius: 50%;
    width: 92px;
    height: 92px;
    margin: 10px 0;
}
.face.face--small img {
  width: 40px;
  height: 40px;
}
</style>
