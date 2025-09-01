import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordCategoryReq, WordCategoryRes } from 'common-lib/api/word/category';
import { Category } from '../../db/models/Category';

createApi<WordCategoryReq, WordCategoryRes>('/word/category', async (req, res) => {
    await tryResponse(res, async () => {
        const category = await Category.findByPk(req.body.id, { attributes: ['value', 'description'] });
        if (!category) {
            return fail(res, 'not_exists');
        }
        succeed(res, category);
    });
});
