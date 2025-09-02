import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore(
    'theme',
    () => {
        const isDark = ref(false);

        watch(isDark, (value) => {
            const htmlElem = document.documentElement;
            if (value) {
                htmlElem.classList.add('dark');
            } else {
                htmlElem.classList.remove('dark');
            }
        });

        return { isDark };
    },
    {
        persist: true,
    },
);
