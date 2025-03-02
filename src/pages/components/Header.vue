<script setup>
import "leaflet/dist/leaflet.css";
import { ref } from 'vue'
import Map from './Map.vue'
const props = defineProps({
  title: String,
  zoom: Number,
  center: Array
});
import countryData from '../../../public/data/countries.json';
const title = props.title || 'the world';
const places = Object.keys( countryData ).map( ( c ) => {
  return { path: `/country/${c}`, coordinates: [ countryData[c].lat, countryData[c].lon ] }
} );
const mapActive = ref( false );
const toggleMap = () => {
  mapActive.value = !mapActive.value;
}
const center = props.center || [ 0, 0 ];
</script>

<template>
  <header class="page-header">
    <div class="map" v-if="mapActive">
      <Map :places="places" :center="center" :zoom="zoom" />
      <button class="closeBtn" @click="toggleMap">close</button>
    </div>
    <div v-else>
    <img class="hero" alt="someday" src="./someday-map.png">
    <p>we will see</p>
    <h1>{{ title }}</h1>
    <img @click="toggleMap" class="mapBtn" src="./mapicon.png">
    </div>
    <slot />
  </header>
</template>

<style>
.closeBtn {
  position: absolute;
    right: -20px;
    top: 0;
    z-index: 10000;
}
.page-header {
    height: 290px;
    background-color: #fcfbe8;
    max-width: 500px;
    margin: auto;
    position: relative;
}
.page-header > .map {
  width: 100%;
  height: 250px;
}
@media screen and ( min-width: 700px ) {
  .page-header {
    margin-bottom: 30px;
  }
}
.page-header .bg {
    background-image: url( './map.png' );
    background-size: 100% auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0.1;
}
.page-header img.hero {
    margin-top: 14px;
    max-width: 400px;
    height: auto;
    width: 100%;
    margin-bottom: -30px;
}
.page-header p {
    font-weight: 700;
    height: 20px;
    margin-top: -25px;
    color: #a7030f;
    margin: 0;
    text-transform: uppercase;
}
.page-header h1 {
    font-weight: 700;
    font-size: 1.9em;
    font-family: sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 2px 0 0;
    padding-top: 4px;
    text-transform: uppercase;
}
.page-header img.mapBtn {
    width: 60px;
    position: absolute;
    left: 10px;
    bottom: 50px;
    cursor: pointer;
}
.page-header input {
  color: #00ab9f;
  height: 40px;
    font-family: sans-serif;
    font-weight: 100;
    text-align: center;
    line-height: 40px;
    text-transform: uppercase;
    background: #fff;
    padding-left: 30px;
    cursor: pointer;
    width: 100%;
    margin: auto;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    left: 0;
    border: 0;
}
</style>
