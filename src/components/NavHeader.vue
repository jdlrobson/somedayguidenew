<script setup>
</script>

<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
  </nav>
</template>

<style scoped>
nav {
  background: #3c2415;
  text-align: right;
  text-transform: uppercase;
  font-size: .6em;
  color: #aaa;
  overflow: hidden;
  padding: 10px 1em;
  margin: auto;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
}
nav a {
  color: white;
  font-weight: bold;
}
</style>
