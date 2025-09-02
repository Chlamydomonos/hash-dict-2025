import { createRouter, createWebHistory } from 'vue-router';
import { wordRoute } from './word';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/RegisterView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
        },
        {
            path: '/search/:word',
            name: 'search',
            component: () => import('@/views/SearchView.vue'),
            props: true,
        },
        {
            path: '/',
            name: 'main',
            component: () => import('@/views/MainView.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('@/views/HomeView.vue'),
                },
                wordRoute,
            ],
        },
    ],
});

export default router;
