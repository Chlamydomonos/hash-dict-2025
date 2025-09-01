import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { UserValidateReq, UserValidateRes } from 'common-lib/api/user/validate';
import { User } from '../../db/models/User';
import { Op } from '@sequelize/core';

createApi<UserValidateReq, UserValidateRes>('/user/validate', async (req, res) => {
    await tryResponse(res, async () => {
        const { ids } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }
            const users = await User.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id'], transaction });
            if (users.length < ids.length) {
                const userSet = new Set(users.map((u) => u.id));
                return fail(res, 'not_exists', { ids: ids.filter((id) => !userSet.has(id)) });
            }

            await User.update({ valid: true }, { where: { id: { [Op.in]: ids } }, transaction });
            succeed(res);
        });
    });
});
