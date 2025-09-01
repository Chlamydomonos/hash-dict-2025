import { needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { UserListReq, UserListRes } from 'common-lib/api/user/list';
import { User } from '../../db/models/User';

createApi<UserListReq, UserListRes>('/user/list', async (req, res) => {
    await tryResponse(res, async () => {
        const { start, limit, filter } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            const data = await User.findAll({
                where: filter ? { valid: filter == 'valid' } : undefined,
                order: [['id', 'DESC']],
                limit,
                offset: start,
                attributes: ['id', 'name', 'valid'],
                transaction,
            });

            succeed(res, { data });
        });
    });
});
