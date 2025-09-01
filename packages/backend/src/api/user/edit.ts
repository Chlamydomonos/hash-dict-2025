import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import { type UserEditReq, type UserEditRes } from 'common-lib/api/user/edit';
import { User } from '../../db/models/User';

createApi<UserEditReq, UserEditRes>('/user/edit', async (req, res) => {
    await tryResponse(res, async () => {
        const { name, passwordHash } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            if (name) {
                const existing = await User.findOne({ where: { name }, transaction });
                if (existing) {
                    return fail(res, 'exists');
                }

                user.name = name;
            }

            if (passwordHash) {
                user.passwordHash = passwordHash;
            }

            await user.save({ transaction });
        });

        succeed(res);
    });
});
