import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordDeleteTypeReq, WordDeleteTypeRes } from 'common-lib/api/word/delete-type';
import { Type } from '../../db/models/Type';

createApi<WordDeleteTypeReq, WordDeleteTypeRes>('/word/delete-type', async (req, res) => {
    await tryResponse(res, async () => {
        const { id } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }
            await Type.destroy({ where: { id }, transaction });
            succeed(res);
        });
    });
});
