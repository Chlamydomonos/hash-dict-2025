import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordDeleteCategoryReq, WordDeleteCategoryRes } from 'common-lib/api/word/delete-category';
import { Category } from '../../db/models/Category';

createApi<WordDeleteCategoryReq, WordDeleteCategoryRes>('/word/delete-category', async (req, res) => {
    await tryResponse(res, async () => {
        const { id } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }
            await Category.destroy({ where: { id }, transaction });
            succeed(res);
        });
    });
});
