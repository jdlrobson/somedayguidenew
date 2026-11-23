<script setup>
import { ref } from 'vue';
const props = defineProps({
  climate: Array
});

const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const d = new Date()
const activeMonth = ref(d.getMonth());

const setMonth = ( ev ) => {
    activeMonth.value = parseInt( ev.target.value, 10 );
};
const climateC = props.climate.map( ( c, i ) =>
    Object.assign( c, {
        heading: MONTHS[i]
    } )
);

const fromMmToInches = ( val ) => val ? ( val * 0.0393700787402 ).toFixed( 2 ) : val;
const fromCelciusToFahrenheit = ( val ) => val ? ( ( ( 9 * val ) / 5 ) + 32 ).toFixed( 1 ) : val;

const climateF = climateC.map(
    ( c ) => ( {
        heading: c.heading,
        high: fromCelciusToFahrenheit( c.high ),
        low: fromCelciusToFahrenheit( c.low ),
        precipitation: fromMmToInches( c.precipitation )
    } )
);
const isCelcius = ref( !localStorage.getItem( 'units-imperial' ) );

const climate = ref( climateC );
const switchUnits = () => {
    isCelcius.value = !isCelcius.value;
    if ( isCelcius.value ) {
        localStorage.removeItem( 'units-imperial' );
        climate.value = climateC;
    } else {
        localStorage.setItem( 'units-imperial', '1' );
        climate.value = climateF;
    }
};
</script>

<template>
    <div class="climate">
        <h3 class="climate__heading">Average temperatures</h3>
        <input type="range" min="0" max="11"
            @change="setMonth"
            title="Slide to change months" class="climate__select" :value="activeMonth">
        <div v-for="(c, i) in climate" :class="activeMonth === i ? 'month monthActive' : 'month'" :data-metric="isCelcius">
            <h4>{{ c.heading }}</h4>
            <span class="climate__high">{{  c.high }}<sup @click="switchUnits">°{{ isCelcius ? 'C' : 'F' }}</sup></span>
            <span class="climate__low">{{ c.low }}</span>
            <div>Precipitation: {{ c.precipitation }} mm</div>
        </div>
    </div>
</template>
<style>
.climate {
    text-align: center;
    padding-bottom: 16px;
    font-size: .75em;
    font-size: .75em;
    margin-top: 50px;
    display: flex
;
    align-items: center;
    justify-content: center;
    flex-flow: column;
    flex-grow: 1;
}
.climate h3 {
    padding: 0;
    margin: 0;
    font-size: 1em;
}
.climate h4 {
    font-size: 1.5em;
    text-transform: uppercase;
    margin: 8px 0;
}
.climate__high {
    font-size: 3em;
    color: #333;
    margin-right: 4px;
}
.climate__low {
    font-size: 2em;
    color: #aaa;
}
.climate .month {
    display: none;
}
.climate .monthActive {
    display: block;
}
</style>