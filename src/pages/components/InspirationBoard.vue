<script setup>
</script>

<template>
   <div class="postit-board">
        <slot></slot>
   </div>
</template>

<style scoped>
.postit-board {
    display: flex;
    flex-flow: wrap;
    margin: auto;
    align-items: center;
    row-gap: 18px;
    column-gap: 1px;
    justify-content: center;
    margin-top: 30px;
    justify-content: space-between;
    overflow: hidden;
}

@media screen and ( min-width: 800px ) {
    .postit-board {
        justify-content: space-around;
    }
}
</style>
