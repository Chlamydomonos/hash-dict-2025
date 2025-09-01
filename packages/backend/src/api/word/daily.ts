import { succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordDailyReq, WordDailyRes } from 'common-lib/api/word/daily';
import { getDailyWords } from '../../word/get-daily-words';

createApi<WordDailyReq, WordDailyRes>('/word/daily', async (_req, res) => {
    await tryResponse(res, async () => {
        succeed(res, { data: await getDailyWords() });
    });
});
