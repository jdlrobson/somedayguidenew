<script setup>
import { ref, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Postit from './components/Postit.vue';
import InspirationBoard from './components/InspirationBoard.vue';
import countryData from '../../public/data/countries.json';
import regions from '../../public/data/regions.json';
const route = useRoute();
const regionName = route.params.region;
import Note from './components/Note.vue';
const regionInfo = regions[regionName] || {};
const props = defineProps({
  currentSearch: String,
  currentFilter: String,
  currentSort: String
});

const ALL_COUNTRIES_IN_REGION = Object.keys( countryData ).map( ( title ) => {
    return Object.assign( {
        href: `/country/${ title }`
    }, countryData[ title ] );
}).filter((c) => regionInfo.countries.includes(c.title))

const countries = ref(
    ALL_COUNTRIES_IN_REGION
);
const desc = ref(
    regionInfo.description || 'No note about this region of the world'
);

const percentage = Math.floor(
    100 * (
        countries.value
            .filter((c)=>c.seenL !== undefined || c.seen !== undefined ).length /
        countries.value.length
    )
)
</script>
<template>
    <div class="page-home">
        <Header :hero="`your scrapbook for exploring the world`">
        </Header>
        <article>
            <note :isSmall="true">
                <p>{{ desc }}</p>
                <p>{{ percentage }}%</p>
                <p>Explore other parts of <RouterLink to="/">the world</RouterLink>.</p>
            </note>
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
.search {
    height: 40px;
    margin: 10px 0;
    width: 100%;
}
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
