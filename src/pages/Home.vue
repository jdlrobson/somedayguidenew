<script setup>
import { ref, defineProps } from 'vue'
import Header from './components/Header.vue';
import Postit from './components/Postit.vue';
import InspirationBoard from './components/InspirationBoard.vue';
import countryData from '../../public/data/countries.json';
import regionData from '../../public/data/regions.json';
import Filterer from './components/Filterer.vue';
import Note from './components/Note.vue';

const ALL_COUNTRIES = Object.keys( countryData ).map( ( title ) => {
    return Object.assign( {
        href: `/country/${ title }`
    }, countryData[ title ] );
});

const countries = ref(
    ALL_COUNTRIES
);

const filterChange = ( newCountries ) => {
    countries.value = newCountries;
};

</script>
<template>
    <div class="page-home">
        <Header :hero="`your scrapbook for exploring the world`">
        </Header>
        <article>
            <Filterer @filterChange="filterChange"
                :countries="ALL_COUNTRIES"
            >
                <p>Two drifters off to see the world. There's such a lot of world to see. Someday guide provides a jumping off point for finding the highlights, hopefully some day you'll see some of those.</p>
            </Filterer>
            <InspirationBoard>
                <Postit v-for="(c, i) in countries"
                    :title="c.title" :thumbnail="c.thumbnail"
                    :href="c.href"
                    :thumbnailSource="c.thumbnailSource"
                    :style="i % 2 === 0 ? `transform: rotate(3deg)` : `transform: rotate(-3deg)`">
                    <span class="no noL" v-if="c.seenL">✔️{{ c.seenL }}</span>
                    <span class="no" v-if="c.seen">✔️{{ c.seen }}</span>
                    <span class="no noSnip">✂{{ c.snippets }}</span>
                </Postit>
            </InspirationBoard>
        </article>
    </div>
</template>

<style scoped>
.postit .no {
  position: absolute;
  right: 0;
  background: yellow;
  color: black;
  width: 38px;
  height: 20px;
  bottom: 21px;
  padding: 4px;
  opacity: 0.8;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
section.note {
    margin-top: 10px;
}
.postit .noL {
  bottom: 41px;
  background: #afaff3;
}
.postit .noSnip {
    background: #ccc;
    bottom: 61px;
}
p {
    margin-bottom: 0;
}
label {
    margin-right: 8px;
    font-style: italic;
}
select ~ label {
    margin-left: 8px;
}
@media ( max-width: 700px ) {
    .page-home .postit {
        width: 49vw;
        height: 200px;
    }
}
</style>
