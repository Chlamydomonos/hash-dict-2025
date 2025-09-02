import { formats, type WordFormat } from 'common-lib/word/index';
import type { RouteRecordRaw } from 'vue-router';

export const wordRoute: RouteRecordRaw = {
    path: 'word/:format/:typeId/:type/:categories+',
    name: 'word',
    component: () => import('@/views/WordView.vue'),
    beforeEnter: (to) => {
        const { format, typeId, categories } = to.params as {
            format: string;
            typeId: string;
            categories: string[];
        };

        if (!formats.includes(format as WordFormat)) {
            return false;
        }

        if (isNaN(parseInt(typeId))) {
            return false;
        }

        if (categories.length % 2 == 1) {
            return false;
        }

        for (let i = 0; i < categories.length; i += 2) {
            if (isNaN(parseInt(categories[i]))) {
                return false;
            }
        }

        return true;
    },
    props: (to) => {
        const { format, typeId, type, categories } = to.params as {
            format: string;
            typeId: string;
            type: string;
            categories: string[];
        };

        const parsed: { id: number; value: string }[] = [];
        for (let i = 0; i < categories.length; i += 2) {
            parsed.push({ id: parseInt(categories[i]), value: categories[i + 1] });
        }

        return {
            format,
            type: { id: parseInt(typeId), end: type == '0' ? '' : type },
            categories: parsed,
        };
    },
};
