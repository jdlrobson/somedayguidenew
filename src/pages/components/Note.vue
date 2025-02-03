<script setup>
import { computed } from 'vue'
import Thumbtack from './Thumbtack.vue';

const props = defineProps({
    isSmall: true,
  paper: String
})
const noteClass = computed( () => {
    return {
        noteSmall: props.isSmall,
        note: true,
        noteChart: props.paper === 'chart'
    }
} );
</script>

<template>
   <section :class="noteClass">
        <Thumbtack></Thumbtack>
        <slot></slot>
    </section>
</template>

<style>
section.note {
    background: white;
    padding: 16px 40px 32px;
    position: relative;
    width: 100%;
    text-align: left;
    margin: auto;
}
section.noteChart {
    background-image: url( ./chart.png );
    line-height: 43px;
    padding-top: 16px;
}

section.note img {
    width: 100%;
    height: auto;
    max-width: 100%;
}

section.note .thumbtack {
    margin-top: -20px;
}

section.note.noteSmall {
    width: 100%;
}
@media screen and ( min-width: 800px ) {
    section.note.noteSmall {
        width: 550px;
    }
}
</style>
