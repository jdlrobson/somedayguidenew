<script setup>
import { ref, defineProps } from 'vue'
import { useRouter } from 'vue-router';
import L from 'leaflet'
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
const router = useRouter();
const navigateTo = ( path ) => {
  router.push({ path })
}
const props = defineProps({
  places: Array,
  zoom: Number,
  center: Array
} );
const places = props.places || [];
const center = props.center || [47.41322, -1.219482];
const zoom = ref( props.zoom || 2 );

console.log(places,center,zoom)
</script>
<template>
    <LMap class="map" ref="map" v-model:zoom="zoom" :center="center">
        <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker v-for="p in places" :lat-lng="p.coordinates"
            @click="navigateTo(p.path)"></l-marker>
    </LMap>
</template>
<style>
.map {
    min-height: 250px;
}
</style>