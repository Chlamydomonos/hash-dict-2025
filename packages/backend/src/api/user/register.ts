import { fail, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import { type UserRegisterReq, type UserRegisterRes } from 'common-lib/api/user/register';
import { User } from '../../db/models/User';

createApi<UserRegisterReq, UserRegisterRes>('/user/register', async (req, res) => {
    await tryResponse(res, async () => {
        const { name, passwordHash } = req.body;
        await db.transaction(async (transaction) => {
            const user = await User.findOne({ where: { name }, transaction });
            if (user) {
                return fail(res, 'exists');
            }
            await User.create({ name, passwordHash }, { transaction });
        });
        succeed(res);
    });
});
