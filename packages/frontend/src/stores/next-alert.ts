import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNextAlertStore = defineStore('nextAlert', () => {
    const values = ref<
        {
            message: string;
            keep: boolean;
            type: 'error' | 'info' | 'primary' | 'success' | 'warning';
            html: boolean;
        }[]
    >([]);

    return { values };
});
