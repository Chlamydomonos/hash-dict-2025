import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import { type UserDeleteReq, type UserDeleteRes } from 'common-lib/api/user/delete';
import { User } from '../../db/models/User';
import { sessionManager } from '../../session-manager';
import { Op } from '@sequelize/core';

createApi<UserDeleteReq, UserDeleteRes>('/user/delete', async (req, res) => {
    await tryResponse(res, async () => {
        const { names } = req.body;
        const userIds = await db.transaction(async (transaction) => {
            if (!(await needLogin(req, res, { transaction }))) {
                return;
            }

            const users = await User.findAll({ where: { name: { [Op.in]: names } }, transaction });
            const userIds = users.map((u) => u.id);
            for (const id of userIds) {
                sessionManager.logoutAllUserSessions(id);
            }

            await User.destroy({ where: { id: { [Op.in]: userIds } }, transaction });
            return userIds;
        });

        if (!userIds) {
            return fail(res, 'unknown');
        }

        for (const id of userIds) {
            sessionManager.logoutAllUserSessions(id);
        }

        succeed(res);
    });
});
