import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordEditTypeReq, WordEditTypeRes } from 'common-lib/api/word/edit-type';
import { Type } from '../../db/models/Type';

createApi<WordEditTypeReq, WordEditTypeRes>('/word/edit-type', async (req, res) => {
    await tryResponse(res, async () => {
        const { id, description } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }
            const type = await Type.findByPk(id);
            if (!type) {
                return fail(res, 'not_exists');
            }
            await type.update('description', description, { transaction });
            succeed(res);
        });
    });
});
