import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingCategoryReq, EmbeddingCategoryRes } from 'common-lib/api/embedding/category';
import { Category } from '../../db/models/Category';

createApi<EmbeddingCategoryReq, EmbeddingCategoryRes>('/embedding/category', async (req, res) => {
    await tryResponse(res, async () => {
        const category = await Category.findByPk(req.body.id);
        if (!category) {
            return fail(res, 'not_exists');
        }
        succeed(res, { embedded: !!category.vectorId });
    });
});
