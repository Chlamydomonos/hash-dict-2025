import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordListReq, WordListRes } from 'common-lib/api/word/list';
import { Type } from '../../db/models/Type';
import { Category } from '../../db/models/Category';

createApi<WordListReq, WordListRes>('/word/list', async (req, res) => {
    await tryResponse(res, async () => {
        const { typeId, parentId, start, limit } = req.body;
        await db.transaction(async (transaction) => {
            const type = await Type.findByPk(typeId, { transaction });
            if (!type) {
                return fail(res, 'type_not_exists');
            }

            const parent = parentId ? await Category.findByPk(parentId, { transaction }) : undefined;
            if (parentId !== null && !parent) {
                return fail(res, 'parent_not_exists');
            }

            const data = await Category.findAll({
                where: { typeId, parentId },
                attributes: ['id', 'value'],
                order: ['compareValue'],
                limit,
                offset: start,
            });

            succeed(res, { data: data.map((c) => ({ id: c.id, value: c.value })) });
        });
    });
});
