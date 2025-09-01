import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordEditCategoryReq, WordEditCategoryRes } from 'common-lib/api/word/edit-category';
import { Category } from '../../db/models/Category';

createApi<WordEditCategoryReq, WordEditCategoryRes>('/word/edit-category', async (req, res) => {
    await tryResponse(res, async () => {
        const { id, description } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }
            const category = await Category.findByPk(id, { transaction });
            if (!category) {
                return fail(res, 'not_exists');
            }
            await category.update('description', description, { transaction });
            succeed(res);
        });
    });
});
