import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordCreateTypeReq, WordCreateTypeRes } from 'common-lib/api/word/create-type';
import { Type } from '../../db/models/Type';

createApi<WordCreateTypeReq, WordCreateTypeRes>('/word/create-type', async (req, res) => {
    await tryResponse(res, async () => {
        const { end, description } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            if (!/^[bpmfdtnlzcsgkhjr]?$/.test(end)) {
                return fail(res, 'illegal');
            }

            const type = await Type.findOne({ where: { end }, transaction });
            if (type) {
                return fail(res, 'exists');
            }

            const newType = await Type.create({ end, description }, { transaction });
            succeed(res, { id: newType.id });
        });
    });
});
