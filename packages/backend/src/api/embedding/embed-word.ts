import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingEmbedWordReq, EmbeddingEmbedWordRes } from 'common-lib/api/embedding/embed-word';
import { Category } from '../../db/models/Category';
import { InProgressError, NoClientError } from '../../embedding/embedding-manager';

createApi<EmbeddingEmbedWordReq, EmbeddingEmbedWordRes>('/embedding/embed-word', async (req, res) => {
    await tryResponse(res, async () => {
        const user = await needLogin(req, res);
        if (!user) {
            return;
        }

        const { id } = req.body;

        try {
            const word = await Category.findByPk(id);
            if (!word) {
                fail(res, 'not_exists');
            }

            await embeddingManager.embedWord(id);
            succeed(res);
        } catch (e) {
            if (e instanceof NoClientError) {
                fail(res, 'no_client');
            } else if (e instanceof InProgressError) {
                fail(res, 'embed_all_in_progress');
            } else {
                fail(res, 'unknown');
            }
        }
    });
});
