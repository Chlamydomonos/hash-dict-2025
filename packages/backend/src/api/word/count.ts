import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordCountReq, WordCountRes } from 'common-lib/api/word/count';
import { Type } from '../../db/models/Type';
import { Category } from '../../db/models/Category';

createApi<WordCountReq, WordCountRes>('/word/count', async (req, res) => {
    await tryResponse(res, async () => {
        const { typeId, parentId } = req.body;
        await db.transaction(async (transaction) => {
            const type = await Type.findByPk(typeId, { transaction });
            if (!type) {
                return fail(res, 'type_not_exists');
            }

            const parent = parentId ? await Category.findByPk(parentId, { transaction }) : undefined;
            if (parentId !== null && !parent) {
                return fail(res, 'parent_not_exists');
            }

            const count = await Category.count({ where: { typeId, parentId }, transaction });
            succeed(res, { count });
        });
    });
});
