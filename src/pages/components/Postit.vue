<script setup>
import { ref, onMounted } from 'vue'
import Thumbtack from './Thumbtack.vue';
import LinkLogo from './LinkLogo.vue';

const props = defineProps({
  embed: Boolean,
  big: Boolean,
  title: String,
  thumbnail: String,
  href: String,
  text: String,
  style: String
})
const className = {
  postit: true,
  postitLarge: props.big,
  postitEmbedInstagram: props.embed && ( props.thumbnail || '' ).includes( 'instagram.com') ,
  postitWithNote: props.text
};

const target = ref(
  !props.href || props.href.indexOf( '/' ) === 0 ?
  undefined : '_blank'
);

console.log(target.value, props.href);

onMounted(() => {
  if (window.instgrm) window.instgrm.Embeds.process();
})

console.log(target, props.href);
</script>

<template>
  <div :class="className" :style="style">
    <Thumbtack></Thumbtack>
    <h2 v-if="title">{{ title }}</h2>
    <img v-if="!embed && thumbnail" :src="thumbnail" loading="lazy">
    <div class="postit-text" v-if="text">
      <span v-html="text"></span>
    </div>
    <a v-if="target" class="a-internal" :target="target" :href="href"></a>
    <router-link v-else class="a-external" :to="href"></router-link>
    <slot></slot>
    <link-logo v-if="href" :href="href"></link-logo>
  </div>
</template>

<style>
.postit {
  width: 100vw;
  height: 400px;
  display: flex;
  position: relative;
  overflow: hidden;
  transition: transform;
  background: #ffffc1;
  justify-content: center;
}
.postit > a {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
}

.postit h2 + *:last-child {
  display: flex;
  margin-top: 50px;
  align-items: center;
}
.postit:hover {
  z-index: 10;
  transform: rotate( 0deg ) !important;
  border: solid 5px white;
}
.postitEmbedInstagram {
    height: 810px;
}
@media screen and ( min-width: 600px ) {
  .postit {
    width: 220px;
    height: 220px;
  }
  .postitLarge {
    width: 400px;
    height: 400px;
  }
  .postitEmbedInstagram {
    width: 400px;
    height: 670px;
  }
}

.postit > img {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.postit h2 {
  height: 50px;
  position: absolute;
  top: 0;
  width: 100%;
  background: white;
  z-index: 2;
  background: #00ab9f;
  color: white;
  margin: 0;
  padding: 8px 0 0;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.postit .linkLogo {
  position: absolute;
  bottom: 0;
  right: 12px;
}

.postit .linkLogo img {
  width: 40px;
  height: 40px;
}
.postit-text {
  z-index: 2;
  padding: 0 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    opacity: 0.8;
}
.postit-text span {
  background: black;
    color: white;
    padding: 8px;
}</style>
