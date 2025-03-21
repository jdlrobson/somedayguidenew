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
});

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
        case 'name':
            countries.value = countries.value
                .sort((a,a1) => a.title < a1.title ? -1 : 1 );
            break;
        case 'updated':
        default:
            console.log('go');
            countries.value = countries.value
                    .sort(sortByField('updated', 1));
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
applySort();
if ( location.hash === '#search' ) {
    setTimeout( () => {
        const search = document.querySelector('#search');
        search.scrollIntoView();
        search.focus();
    }, 300 );
}
</script>
<template>
    <div class="page-home">
        <Header :hero="`your scrapbook for exploring the world`">
        </Header>
        <article>
            <note :isSmall="true">
                <p>Two drifters off to see the world. There's such a lot of world to see. Someday guide provides a jumping off point for finding the highlights, hopefully some day you'll see some of those.</p>
                <p>Where in the world shall we dream about today?</p>
                <p>
                    <a href="#search">search</a> {{  countries.length }} / {{ ALL_COUNTRIES.length }} countries
                </p>
                <p>
                    <label>filter by</label>
                    <select @change="changeFilter">
                        <option value="none">all</option>
                        <option value="seen">seen</option>
                        <option value="dream">dream</option>
                    </select>
                    <label>sort by</label>
                    <select @change="changeSort">
                        <option value="updated">updated</option>
                        <option value="name">name</option>
                        <option value="linz">Linzy</option>
                        <option value="jon">Jon</option>
                        <option value="notes">snippets</option>
                    </select>
                </p>
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
