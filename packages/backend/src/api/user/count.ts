import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { UserCountReq, UserCountRes } from 'common-lib/api/user/count';
import { User } from '../../db/models/User';

createApi<UserCountReq, UserCountRes>('/user/count', async (req, res) => {
    await tryResponse(res, async () => {
        const { filter } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            const count = await User.count({ where: filter ? { valid: filter == 'valid' } : undefined, transaction });
            succeed(res, { count });
        });
    });
});
