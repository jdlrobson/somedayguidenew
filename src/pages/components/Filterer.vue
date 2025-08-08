<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import Note from './Note.vue';
import regionData from '../../../public/data/regions.json';
const regionNames = ref( Object.keys(regionData) ); 
const props = defineProps({
  countries: Array,
  currentSearch: String,
  currentFilter: String,
  currentSort: String
});

const currentSearch = ref( props.currentSearch || '' );
const currentFilter = ref( props.currentFilter || '' );
const currentSort = ref( props.currentSort || '' );

const filter = ( name ) => {
    currentFilter.value = name;
    applyFilter();
};

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


const ALL_COUNTRIES = props.countries || [];
const countries = ref(
    ALL_COUNTRIES
);

const emit = defineEmits({
  filterChange: ( countries ) => {
    return countries;
  }
})
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
    emit('filterChange', countries.value);
};

const sortBy = ( key ) => {
    currentSort.value = key;
    applyFilter();
};

const changeFilter = ( ev ) => {
    filter(ev.target.value);
};
const changeSort = ( ev ) => {
    sortBy(ev.target.value);
};

</script>
<template>
    <note :isSmall="true">
        <slot />
        <p>Where in the world shall we dream about today?</p>
        <p>
            <a href="#search">search</a> {{  countries.length }} / {{ ALL_COUNTRIES.length }} countries
        </p>
        <p>or explore a region:
            <span v-for="(region, i) in regionNames">
                <router-link :to="`/region/${region}`">{{ region }}</router-link>&nbsp;
            </span>
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
</template>
