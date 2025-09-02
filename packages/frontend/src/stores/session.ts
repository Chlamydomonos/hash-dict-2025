import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSessionStore = defineStore(
    'session',
    () => {
        const userName = ref<string>();
        const passwordHash = ref<string>();
        const sessionToken = ref<string>();
        const loggedIn = ref(false);
        return { userName, passwordHash, sessionToken, loggedIn };
    },
    {
        persist: true,
    },
);
