<script setup>
import EditLink from './EditLink.vue';
import Note from './Note.vue';
const props = defineProps({
    note: '',
    href: '',
    wikivoyage: false,
    title: ''
})
const wikivoyage = props.title ? `https://en.wikivoyage.org/wiki/${props.title}` : '';
</script>
<template>
    <note>
        <h2>Note to self</h2>
        <div v-if="note">
            <div v-html="note"></div>
            <edit-link :href="href"></edit-link>
            <p v-if="wikivoyage">
                More information on <a :href="wikivoyage" target="_blank">Wikivoyage</a>.
            </p>
        </div>
        <div v-else class="loading">
        </div>
    </note>
</template>

<style>
.loading {
    background-image: url(./components/bball.png);
    background-image: url(/src/pages/components/bball.png);
    min-height: 100px;
    background-size: 100px 100px;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: left center;
}
</style>
