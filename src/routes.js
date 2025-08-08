
import Home from './pages/Home.vue';
import Country from './pages/Country.vue';
import Region from './pages/Region.vue';
import About from './pages/About.vue';
import PageNotFound from './pages/PageNotFound.vue';

export default [
    {
        path: '/',
        component: Home
    },
    {
        path: '/about',
        component: About
    },
    {
        path: '/country/:country',
        component: Country
    },
    {
        path: '/region/:region',
        component: Region
    },
    {
        path: '/:catchAll(.*)',
        component: PageNotFound
    }
]