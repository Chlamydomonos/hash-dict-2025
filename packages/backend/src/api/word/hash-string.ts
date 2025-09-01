import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordHashStringReq, WordHashStringRes } from 'common-lib/api/word/hash-string';
import { hashString, ParentNonExistError, TypeNonExistError } from '../../word/hash-string';
import { HashFullError } from 'common-lib/hash/reserved';

createApi<WordHashStringReq, WordHashStringRes>('/word/hash-string', async (req, res) => {
    await tryResponse(res, async () => {
        const { typeId, parentId, original } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            try {
                const value = await hashString(original, parentId, typeId, transaction);
                succeed(res, { value });
            } catch (e) {
                if (e instanceof ParentNonExistError) {
                    return fail(res, 'parent_not_exists');
                } else if (e instanceof TypeNonExistError) {
                    return fail(res, 'type_not_exists');
                } else if (e instanceof HashFullError) {
                    return fail(res, 'hash_full');
                } else {
                    throw e;
                }
            }
        });
    });
});
