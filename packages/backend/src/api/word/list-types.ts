import { succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordListTypesReq, WordListTypesRes } from 'common-lib/api/word/list-types';
import { Type } from '../../db/models/Type';

createApi<WordListTypesReq, WordListTypesRes>('/word/list-types', async (_req, res) => {
    await tryResponse(res, async () => {
        const data = await Type.findAll({ attributes: ['id', 'end'], order: ['id'] });
        succeed(res, { data });
    });
});
