<script setup>
import { ref } from 'vue'
import Note from './Note.vue';
import Face from './Face.vue';
const props = defineProps({
    seenL: Number,
    seen: Number,
    useBoolean: Boolean
});
const getOpacity = ( seen ) => seen ? '' : 'opacity: 0.5'

const getStatus = ( seen ) => seen === 1 ? 'yes' : 'no';
const getCount = ( seen ) => `#${seen || '??'}`;
const getCaption = ( seen, useBoolean ) => useBoolean ? getStatus( seen ) : getCount( seen );
const msgLinz = ref( getCaption( props.seenL, props.useBoolean ) );
const msgJon = ref( getCaption( props.seen, props.useBoolean ) );
</script>

<template>  
    <note>
        <h2>Who's been?</h2>
        <div class="face-lineup">
            <face :style="getOpacity(seenL)" name="linz">{{ msgLinz }}</face>
            <face :style="getOpacity(seen) "name="jon">{{ msgJon }}</face>
        </div>
    </note>
</template>

<style scoped>
.face-lineup {
    display: flex;
    column-gap: 8px;
    flex-flow: row;
    flex-wrap: wrap;
}
</style>
