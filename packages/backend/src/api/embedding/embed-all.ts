import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingEmbedAllReq, EmbeddingEmbedAllRes } from 'common-lib/api/embedding/embed-all';

createApi<EmbeddingEmbedAllReq, EmbeddingEmbedAllRes>('/embedding/embed-all', async (req, res) => {
    await tryResponse(res, async () => {
        const user = await needLogin(req, res);
        if (!user) {
            return;
        }

        await embeddingManager.startEmbedAllTask();
        succeed(res);
    });
});
