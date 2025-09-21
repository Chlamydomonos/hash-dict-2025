import { createApi } from '../../create-api';
import { type UserLoginReq, type UserLoginRes } from 'common-lib/api/user/login';
import { LoginResult, sessionManager } from '../../session-manager';
import { fail, succeed, tryResponse } from '../../api-helper';
import { cors } from '../../cors';

createApi<UserLoginReq, UserLoginRes>(
    '/user/login',
    async (req, res) => {
        await tryResponse(res, async () => {
            const { name, passwordHash } = req.body;
            const result = await sessionManager.login(name, passwordHash);
            switch (result.result) {
                case LoginResult.SUCCESS:
                    return succeed(res, { sessionToken: result.token! });
                case LoginResult.USER_NOT_FOUND:
                    return fail(res, 'not_exists');
                case LoginResult.INVALID_PASSWORD:
                    return fail(res, 'wrong_password');
                case LoginResult.USER_INVALID:
                    return fail(res, 'invalid');
                default:
                    return fail(res, 'unknown');
            }
        });
    },
    [cors],
);
