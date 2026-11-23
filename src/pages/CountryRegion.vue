<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { useRoute } from 'vue-router';
const route = useRoute();
const countryName = route.params.country;
const regionName = route.params.region;
import Header from './components/Header.vue';
import Note from './components/Note.vue';
import countryData from '../../public/data/countries.json';
import StoryBoard from './components/StoryBoard.vue';
import Postit from './components/Postit.vue';
import InspirationBoard from './components/InspirationBoard.vue';
import Climate from './components/Climate.vue';
import WhosBeen from './components/WhosBeen.vue';
import SnipLink from './components/SnipLink.vue';
import Map from './components/Map.vue';
import EmbedInstagram from './components/EmbedInstagram.vue';
import EmbedYoutube from './components/EmbedYoutube.vue';
import NoteToSelf from './components/NoteToSelf.vue';
const country = ref(
    countryData[countryName]
);
const center = ref( [
    country.value.lat,
    country.value.lon
] );
const zoom = ref( country.value.zoom );
const editUrl = `https://github.com/jdlrobson/somedayguidenew/edit/main/notes/country/${countryName}/note.txt`;
const addSnippetUrl = `https://github.com/jdlrobson/somedayguidenew/new/main/notes/country/${countryName}/snippets`;
const editDestinationsUrl = `https://github.com/jdlrobson/somedayguidenew/edit/main/notes/country/${countryName}/${regionName}/destinations.txt`
const places = ref( {} );
const snippets = ref( [] );
const airports = ref( [] );
const note = ref( '' );
const currentRegion = ref( {
    seenL: 0,
    seen: 0
} );
const destinationCoordinates = ref( [] );
const loadInstagram = () => {
    if (window.instgrm) window.instgrm.Embeds.process();
}
onUpdated(() => {
    loadInstagram();
} );
const mapReady = ref( false );

let hero = ref( '' );
const makeHero = ( isLoaded ) => {
    const count = isLoaded ? snippets.value.length : '■';
    hero.value = `${ count } hand curated things to see in ${regionName}, ${countryName}`;
};
makeHero();

onMounted(() => {
    fetch(`/data/country/${countryName}/${regionName}.json`).then((r) => r.json())
        .then(( region ) => {
            currentRegion.value = region;
            airports.value = region.airports;
            note.value = region.note;
            places.value = region.places;
            const placeKeys = Object.keys(region.places);
            destinationCoordinates.value = placeKeys.filter((p)=>places.value[p].lat).map((title) => {
                const p = places.value[title];
                return {
                    title,
                    coordinates: [ p.lat, p.lon ],
                    path: '#'
                };
            })
            mapReady.value = true;
            snippets.value = region.snippets;
            makeHero( true );
            loadInstagram();
        })
})

const countryUrl = `/country/${countryName}`;
</script>
<template>
    <div class="page-country">
        <Header :title="regionName" :center="center" :zoom="zoom"
            :hero="hero"></Header>
        <article>
            <note :is-wide="true">
                Noteworthy places in {{ regionName }}, <RouterLink :to="countryUrl">{{ countryName }}</RouterLink> that we've been or bookmarked for later.
            </note>
            <StoryBoard>
                <WhosBeen :seenL="currentRegion.seenL" :seen="currentRegion.seen" :use-boolean="true"></WhosBeen>
                <note>
                    <Map v-if="mapReady"
                        :places="destinationCoordinates"
                        :center="[ country.lat, country.lon ]" :zoom="country.zoom || 8"></Map>
                    <a :href="editDestinationsUrl" class="editLink">edit</a>
                </note>
                <note v-if="airports.length">
                    <strong>Airports: </strong>
                    <p>
                        <span v-for="a in airports">
                            <a target="_blank"
                            :href="`https://www.flightaware.com/live/airport/${ a }`">{{ a }}</a>&nbsp;
                        </span>
                    </p>
                </note>
                <NoteToSelf :is-wide="true" :note="note" :url="editUrl"></NoteToSelf>
            </StoryBoard>
            <InspirationBoard>
                 <Postit v-for="(s, i) in snippets" @click="loadInstagram"
                    :big="true"
                    :title="s.title"
                    :text="s.text"
                    :embed="s.embed"
                    :href="s.url"
                    :thumbnailSource="s.source"
                    :editUrl="`https://github.com/jdlrobson/somedayguidenew/edit/main/notes/country/${countryName}/snippets/${s.id}.txt`"
                    :thumbnail="s.src">
                    <div class="embed">
                        <EmbedYoutube
                            v-if="s.src && s.src.indexOf('youtube') > -1"
                            :src="s.src"></EmbedYoutube>
                        <EmbedInstagram
                            v-else-if="s.src && s.src.indexOf('instagram.com') > -1"
                            :src="s.src" :href="s.href"></EmbedInstagram>
                    </div>
                </Postit>
            </InspirationBoard>
            <SnipLink :href="addSnippetUrl"></SnipLink>
            <InspirationBoard>
                <Postit v-for="(d, i) in Object.keys(places)"
                    :title="d"
                    :embed="true">
                    <climate v-if="places[d] && places[d].climate" :climate="places[d].climate">
                    </climate>
                    <div v-else>No climate information available.</div>
                </Postit>
            </InspirationBoard>
        </article>
    </div>
</template>

<style scoped>
.embed {
    display: flex;
    align-items: center;
}
.loading {
    background-image: url(./components/bball.png);
    background-image: url(/src/pages/components/bball.png);
    background-size: 100px 100px;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: left center;
}
.editLink {
    position: absolute;
    top: 8px;
    right: 8px;
    color: gray;
    z-index: 2000;
}
</style>
