
import Home from './pages/Home.vue';
import Country from './pages/Country.vue';
import About from './pages/About.vue';

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
]