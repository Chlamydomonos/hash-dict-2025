import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingQueryReq, EmbeddingQueryRes } from 'common-lib/api/embedding/query';
import { Category } from '../../db/models/Category';
import { Op } from '@sequelize/core';
import { chain } from '../../word/chain';
import { cors } from '../../cors';

createApi<EmbeddingQueryReq, EmbeddingQueryRes>(
    '/embedding/query',
    async (req, res) => {
        await tryResponse(res, async () => {
            await db.transaction(async (transaction) => {
                if (!chroma) {
                    return fail(res, 'unknown');
                }

                const user = await needLogin(req, res, { transaction });
                if (!user) {
                    return;
                }
                if (!embeddingClientManager.hasLoggedInClient(user.id)) {
                    return fail(res, 'no_client');
                }

                if (embeddingManager.embedding()) {
                    return fail(res, 'embedding');
                }

                const result = await chroma.query({
                    queryTexts: [req.body.text],
                    nResults: 10,
                });

                const ids = result.ids.flatMap((l) => l.map((s) => parseInt(s)));
                const count = await Category.count({ where: { id: { [Op.in]: ids } }, transaction });
                if (count < ids.length) {
                    return fail(res, 'unknown');
                }
                const data = await Promise.all(ids.map((id) => chain(id, transaction)));
                succeed(res, { data });
            });
        });
    },
    [cors],
);
