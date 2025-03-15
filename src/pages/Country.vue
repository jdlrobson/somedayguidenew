<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { useRoute } from 'vue-router';
const route = useRoute();
const countryName = route.params.country;
import Header from './components/Header.vue';
import Note from './components/Note.vue';
import countryData from '../../public/data/countries.json';
import Face from './components/Face.vue';
import StoryBoard from './components/StoryBoard.vue';
import ImageCircle from './components/ImageCircle.vue';
import Postit from './components/Postit.vue';
import InspirationBoard from './components/InspirationBoard.vue';
import Climate from './components/Climate.vue';
import Map from './components/Map.vue';
import EmbedInstagram from './components/EmbedInstagram.vue';
import EmbedYoutube from './components/EmbedYoutube.vue';

const countries = ref( countryData );
const country = ref(
    countryData[countryName]
);
const center = ref( [
    country.value.lat,
    country.value.lon
] );
const zoom = ref( country.value.zoom );
const getOpacity = ( seen ) => seen ? '' : 'opacity: 0.5'
const editUrl = `https://github.com/jdlrobson/somedayguidenew/tree/master/notes/country/${countryName}/note.txt`;
const addSnippetUrl = `https://github.com/jdlrobson/somedayguidenew/new/main/notes/country/${countryName}/snippets`;

const places = ref( {} );
const snippets = ref( [] );
const note = ref( '' );

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
    hero.value = `${ count } hand curated things to see in ${countryName}`;
};
makeHero();

onMounted(() => {
    fetch(`/data/country/${countryName}.json`).then((r) => r.json())
        .then(( country ) => {
            note.value = country.note;
            places.value = country.places;
            const placeKeys = Object.keys(country.places);
            destinationCoordinates.value = placeKeys.filter((p)=>places.value[p].lat).map((title) => {
                const p = places.value[title];
                return {
                    title,
                    coordinates: [ p.lat, p.lon ],
                    path: '#'
                };
            })
            mapReady.value = true;
            snippets.value = country.snippets;
            makeHero( true );
            loadInstagram();
        })
})

const wikivoyageTitle = country.value.wikivoyageTitle || country.value.title;
const wikivoyage = `https://en.wikivoyage.org/wiki/${wikivoyageTitle}`;
</script>
<template>
    <div class="page-country">
        <Header :title="countryName" :center="center" :zoom="zoom"
            :hero="hero"></Header>
        <article>
            <note>
                <p>{{ country.description }}</p>
            </note>
            <StoryBoard>
                <note>
                    <h2>Who's been?</h2>
                    <div class="face-lineup">
                        <face :style="getOpacity(country.seenL)" name="linz">#{{ country.seenL || '??' }}</face>
                        <face :style="getOpacity(country.seen) "name="jon">#{{ country.seen || '??' }}</face>
                    </div>
                </note>
                <note>
                    <Map v-if="mapReady"
                        :places="destinationCoordinates"
                        :center="[ country.lat, country.lon ]" :zoom="country.zoom || 8"></Map>
                </note>
                <note>
                    <h2>Nearby countries</h2>
                    <div class="country-lineup">
                        <ImageCircle v-for="n in country.neighbors.filter((n) => countries[n])"
                            :href="`/country/${n}`"
                            size="small"
                            :src="countries[n].thumbnail">
                            {{ n }}
                        </ImageCircle>
                    </div>
                    <p v-if="country.airports.length">Airports: <a v-for="a in country.airports"
                        target="_blank"
                        :href="`https://www.flightaware.com/live/airport/${ a }`">{{  a }}<span>&nbsp;</span></a></p>
                </note>
                <note>
                    <h2>Note to self</h2>
                    <div v-if="note">
                        <div v-html="note"></div>
                        <a :href="editUrl">edit</a>
                        <p>
                            More information on <a :href="wikivoyage" target="_blank">Wikivoyage</a>.
                        </p>
                    </div>
                    <div v-else class="loading">
                    </div>
                </note>
            </StoryBoard>
            <InspirationBoard>
                 <Postit v-for="(s, i) in snippets" @click="loadInstagram"
                    :big="true"
                    :title="s.title"
                    :text="s.text"
                    :embed="s.embed"
                    :href="s.url"
                    :thumbnailSource="s.source"
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
            <a target="_blank" :href="addSnippetUrl" class="snipLink">
                ✂ Add snippet
            </a>
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
.page-country .face-lineup {
    display: flex;
    column-gap: 8px;
    flex-flow: row;
    flex-wrap: wrap;
}
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
.country-lineup {
    justify-content: space-between;
    display: flex;
    column-gap: 8px;
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: space-between;
}
.snipLink {
    background: black;
    display: inline-block;
    padding: 8px;
    color: white;
}
</style>
