<script setup>
import { ref, defineProps } from 'vue'
import Header from './components/Header.vue';
import Postit from './components/Postit.vue';
import InspirationBoard from './components/InspirationBoard.vue';
import countryData from '../../public/data/countries.json';
import Note from './components/Note.vue';

const props = defineProps({
  currentSearch: String,
  currentFilter: String,
  currentSort: String
});

const ALL_COUNTRIES = Object.keys( countryData ).map( ( title ) => {
    return Object.assign( {
        href: `/country/${ title }`
    }, countryData[ title ] );
}).sort((c, c2) => c.title < c2.title ? -1 : 1);

const countries = ref(
    ALL_COUNTRIES
);

const currentSearch = ref( props.currentSearch || '' );
const currentFilter = ref( props.currentFilter || '' );
const currentSort = ref( props.currentSort || '' );

const applySort = () => {
    switch ( currentSort.value ) {
        case 'notes':
            countries.value = countries.value
                    .sort(sortByField('snippets', 1));
            break;
        case 'jon':
            countries.value = countries.value
                .sort(sortByField('snippets', 1))
                .sort(sortByField('seenL'))
                .sort(sortByField('seen'));
            break;
        case 'linz':
            countries.value = countries.value
                .sort(sortByField('snippets', 1))
                .sort(sortByField('seen'))
                .sort(sortByField('seenL'));
            break;
        default:
            countries.value = countries.value
                .sort((a,a1) => a.title < a1.title ? -1 : 1 );
            break;
    };
};

const applyFilter = () => {
    switch ( currentFilter.value ) {
        case 'seen':
            countries.value = ALL_COUNTRIES.filter((c) => c.seen || c.seenL);
            break;
        case 'dream':
            countries.value = [].concat( ALL_COUNTRIES.filter((c) => !c.seen && !c.seenL) );
            break;
        default:
            countries.value = ALL_COUNTRIES;
            break;
    }
    countries.value = countries.value.filter((n) => n.title.toLowerCase().includes(currentSearch.value));
    applySort();
};

const filter = ( name ) => {
    currentFilter.value = name;
    applyFilter();
}

const sortByField = ( field, direction = -1 ) => {
    return ( a, b ) => {
        const val1 = a[field];
        const val2 = b[field];
        if ( !val1 ) {
            return 1;
        } else if ( !val2 ) {
            return -1;
        } else {
            return val1 < val2 ? direction : -direction;
        }
    };
}

const sortBy = ( key ) => {
    currentSort.value = key;
    applyFilter();
};

const filterByName = ( ev ) => {
    currentSearch.value = ev.target.value.toLowerCase();
    applyFilter();
}

const changeFilter = ( ev ) => {
    filter(ev.target.value);
};
const changeSort = ( ev ) => {
    sortBy(ev.target.value);
};
</script>
<template>
    <div class="page-home">
        <Header>
        </Header>
        <article>
            <note :isSmall="true">
                <p>This website is a digital scrapbook meant to inspire exploring the world. The list of countries is currently limited to <a href="https://www.un.org/en/about-us/member-states#gotoV">UN recognized states</a>, but we hope to expand it later. It is made with love by <a href="https://jdlrobson.com">Jon</a> and <a href="https://linzlim.fyi">Linzy</a>.</p>
                <p>Where in the world shall we dream about today?</p>
                <div>
                    <span>filter by</span>
                    <select @change="changeFilter">
                        <option value="none">all</option>
                        <option value="seen">seen</option>
                        <option value="dream">dream</option>
                    </select>
                    sort by
                    <select @change="changeSort">
                        <option value="name">name</option>
                        <option value="linz">Linzy</option>
                        <option value="jon">Jon</option>
                        <option value="notes">snippets</option>
                    </select>
                </div>
                <div>
                    <p>
                        <a href="#search">search</a> {{  countries.length }} / {{ ALL_COUNTRIES.length }} countries

                    </p>
                </div>
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
            <note>
                <input name="search" id="search" class="search" placeholder="Type a country name to filter the post-its" @input="filterByName">
            </note>
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
</style>
