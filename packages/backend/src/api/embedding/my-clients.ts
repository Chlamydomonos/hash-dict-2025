import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { EmbeddingMyClientsReq, EmbeddingMyClientsRes } from 'common-lib/api/embedding/my-clients';

createApi<EmbeddingMyClientsReq, EmbeddingMyClientsRes>('/embedding/my-clients', async (req, res) => {
    await tryResponse(res, async () => {
        const user = await needLogin(req, res);
        if (!user) {
            return;
        }

        succeed(res, {
            count: embeddingClientManager.getUserClients(user.id).length,
            total: embeddingClientManager.getLoggedInClientCount(),
        });
    });
});
