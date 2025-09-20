import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingProgressReq, EmbeddingProgressRes } from 'common-lib/api/embedding/progress';

createApi<EmbeddingProgressReq, EmbeddingProgressRes>('/embedding/progress', async (req, res) => {
    await tryResponse(res, async () => {
        const user = await needLogin(req, res);
        if (!user) {
            return;
        }

        succeed(res, await embeddingManager.getProgress());
    });
});
