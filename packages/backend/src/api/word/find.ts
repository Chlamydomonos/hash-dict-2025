import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordFindReq, WordFindRes } from 'common-lib/api/word/find';
import { findWord, FindWordError } from '../../word/find-word';
import { toBase128 } from 'common-lib/base128';

createApi<WordFindReq, WordFindRes>('/word/find', async (req, res) => {
    await tryResponse(res, async () => {
        let word = req.body.word;
        if (/[bpmfdtnlzcsgkhjr]$/.test(word)) {
            word = word.slice(0, -1);
        }

        try {
            toBase128(word);
        } catch (e) {
            return fail(res, 'illegal');
        }

        try {
            const data = await findWord(req.body.word);
            succeed(res, { data });
        } catch (e) {
            if (e instanceof FindWordError) {
                return fail(res, 'not_exists');
            } else {
                throw e;
            }
        }
    });
});
