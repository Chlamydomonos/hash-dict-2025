import { formats, type WordFormat } from 'common-lib/word/index';
import type { RouteRecordRaw } from 'vue-router';

export const createCategoryRoute: RouteRecordRaw = {
    name: 'create-category',
    path: 'create-category/:format/:typeId/:type/:categories*',
    component: () => import('@/views/CreateCategoryView.vue'),
    beforeEnter: (to) => {
        const { format, typeId, categories } = to.params as {
            format: string;
            typeId: string;
            categories?: string[];
        };

        if (!formats.includes(format as Exclude<WordFormat, WordFormat.DB>)) {
            return false;
        }

        if (isNaN(parseInt(typeId))) {
            return false;
        }

        if (categories) {
            if (categories.length % 2 == 1) {
                return false;
            }

            if (categories.length > 0) {
                for (let i = 0; i < categories.length; i += 2) {
                    if (isNaN(parseInt(categories[i]))) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
    props: (to) => {
        const { format, typeId, type, categories } = to.params as {
            format: string;
            typeId: string;
            type: string;
            categories?: string[];
        };

        const parsed: { id: number; value: string }[] = [];

        if (categories && categories.length > 0) {
            for (let i = 0; i < categories.length; i += 2) {
                parsed.push({ id: parseInt(categories[i]), value: categories[i + 1] });
            }
        }

        return {
            format,
            type: { id: parseInt(typeId), end: type == '0' ? '' : type },
            categories: parsed,
        };
    },
};
