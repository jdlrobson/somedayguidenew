<script setup>
import ImageCircle from './ImageCircle.vue';
import reddit from './reddit.png';

const props = defineProps({
  href: String
});

let src = [ {
    test: 'reddit.com',
    src: reddit
} ].map( ( icon ) => {
    return props.href.indexOf( icon.test ) > -1 ? icon.src : null
} ).filter( ( src ) => !!src )[ 0 ];

if ( !src ) {
    src = '';
}
</script>

<template>
    <ImageCircle v-if="src" class="linkLogo"
        :src="src"></ImageCircle>
    <span v-else></span>
</template>

