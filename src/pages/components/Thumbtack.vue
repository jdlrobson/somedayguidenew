<script setup>
</script>

<template>
  <div class="thumbtack"><img src="./thumbtack.png" loading="lazy"></div>
</template>

<style scoped>
.thumbtack {
    z-index: 5000;
    position: absolute;
    left: 0;
    right: 0;
}
.thumbtack img {
    position: absolute;
    width: 40px;
    height: auto;
    left: 0;
    right: 0;
    margin: auto;
    top: 0;
}
</style>
