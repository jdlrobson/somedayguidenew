<script setup>
const props = defineProps({
  name: String,
  scrolling: Boolean
});
let className = 'story-board';
if ( props.scrolling ) {
    className += ' story-board-scroller';
} else {
    className += ' story-board-wrap';
}
</script>

<template>
   <div :class="className">
        <slot></slot>
   </div>
</template>

<style>
.story-board {
    display: flex;
    margin: auto;
    gap: 8px;
    padding-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.story-board-scroller {
    overflow: scroll;
    flex-wrap: nowrap;
    justify-content: space-around;
}

.story-board-scroller .note {
    min-width: calc(100% - 30px);
}

.story-board-wrap .note {
    max-width: 350px;
}

.story-board .note {
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    margin: 0;
}
@media screen and ( min-width: 600px ) {
    .story-board-scroller .note {
        min-width: 400px;
    }
}
.pageNo {
    position: absolute;
    bottom: 8px;
    right: 8px;
}
</style>
