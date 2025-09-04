import { createRouter, createWebHistory } from 'vue-router';
import { wordRoute } from './word';
import { typeRoute } from './type';
import { useNextAlertStore } from '@/stores/next-alert';
import { ElMessage } from 'element-plus';
import { createCategoryRoute } from './create-category';

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
                typeRoute,
                createCategoryRoute,
                {
                    path: 'create-type/:format',
                    name: 'create-type',
                    component: () => import('@/views/CreateTypeView.vue'),
                    props: true,
                },
                {
                    path: 'admin',
                    name: 'admin',
                    component: () => import('@/views/AdminView.vue'),
                },
                {
                    path: 'edit-user',
                    name: 'edit-user',
                    component: () => import('@/views/EditUserView.vue'),
                },
            ],
        },
    ],
});

router.afterEach(() => {
    const store = useNextAlertStore();
    for (const value of store.values) {
        const { message, html, type, keep } = value;
        ElMessage({
            message,
            dangerouslyUseHTMLString: html,
            type,
            showClose: true,
            duration: keep ? 0 : undefined,
        });
    }
    store.values = [];
});

export default router;
