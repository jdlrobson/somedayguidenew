<script setup>
import Header from './components/Header.vue';
import Note from './components/Note.vue';
import StoryBoard from './components/StoryBoard.vue';

</script>
<template>
    <div class="page-about">
        <Header></Header>
        <article>
            <StoryBoard :scrolling="true">
                <note paper="chart">
                    <span class="pageNo">1 / 3</span>
                    <p>When an <a href="https://linzlim.fyi">accidental traveller</a> meets an <a href="https://jdlrobson.com">occidental adventurer</a> who has a thick scrapbook to see the world… their paths crossed and they started documenting their world together…</p>
                    <img src="./scrapbook.jpeg" alt="our scrapbook">
                </note>
                <note paper="chart">
                    <span class="pageNo">2 / 3</span>
                    <p>…They taught each other to see the world differently. The occidental traveller was taught to slow down and the accidental traveller was shown how big the world really was.</p>
                </note>
                <note paper="chart">
                    <span class="pageNo">3 / 3</span>
                    <p>…but as time progressed they realized there was too much of the world to see.</p>
                </note>
            </StoryBoard>
        </article>
    </div>
</template>

<style scoped>
</style>
