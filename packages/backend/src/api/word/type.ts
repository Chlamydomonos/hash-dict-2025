import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordTypeReq, WordTypeRes } from 'common-lib/api/word/type';
import { Type } from '../../db/models/Type';

createApi<WordTypeReq, WordTypeRes>('/word/type', async (req, res) => {
    await tryResponse(res, async () => {
        const { id } = req.body;
        const type = await Type.findByPk(id, { attributes: ['end', 'description'] });
        if (!type) {
            return fail(res, 'not_exists');
        }
        succeed(res, type.dataValues);
    });
});
