<script setup>
import Header from './components/Header.vue';
import Note from './components/Note.vue';

</script>
<template>
    <div class="page-404">
        <Header :hero="`once we are not lost`"></Header>
        <article>
            <note isSmall="true">
                <p>but there is nothing to see here (404 not found)</p>
                <RouterLink to="/">go home</RouterLink> or find somewhere using the map.
            </note>
        </article>
    </div>
</template>

<style scoped>
</style>
