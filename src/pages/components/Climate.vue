<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  climate: Array
});

const d = new Date()
const activeMonth = ref(d.getMonth());

const setMonth = ( ev ) => {
    activeMonth.value = parseInt( ev.target.value, 10 );
};
</script>

<template>
    <div class="climate">
        <h3 class="climate__heading">Average temperatures</h3>
        <input type="range" min="0" max="11"
            @change="setMonth"
            title="Slide to change months" class="climate__select" value="1">
        <div v-for="(c, i) in climate" :class="activeMonth === i ? 'month monthActive' : 'month'">
            <h4>{{ c.heading }}</h4>
            <span class="climate__high">{{  c.high }}<sup>°C</sup></span>
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