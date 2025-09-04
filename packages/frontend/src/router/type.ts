import { formats, type WordFormat } from 'common-lib/word/index';
import type { RouteRecordRaw } from 'vue-router';

export const typeRoute: RouteRecordRaw = {
    name: 'type',
    path: 'type/:format/:typeId/:type',
    component: () => import('@/views/TypeView.vue'),
    beforeEnter: (to) => {
        const { format, typeId } = to.params as { format: string; typeId: string };
        if (!formats.includes(format as Exclude<WordFormat, WordFormat.DB>)) {
            return false;
        }
        if (isNaN(parseInt(typeId))) {
            return false;
        }
        return true;
    },
    props: (to) => {
        const { format, typeId, type } = to.params as { format: string; typeId: string; type: string };
        return { format, type: { id: parseInt(typeId), end: type == '0' ? '' : type } };
    },
};
