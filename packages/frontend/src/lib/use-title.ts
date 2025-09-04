import { onMounted, type WatchSource } from 'vue';
import { watch as vueWatch } from 'vue';

export const useTitle = (title: string | (() => string), watch?: WatchSource<unknown>) => {
    const setTitle = () => {
        if (typeof title == 'string') {
            document.title = title;
        } else {
            document.title = title();
        }
    };
    onMounted(setTitle);
    if (watch) {
        vueWatch(watch, setTitle);
    }
};
