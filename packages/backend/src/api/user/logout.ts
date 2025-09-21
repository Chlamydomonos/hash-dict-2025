import { createApi } from '../../create-api';
import type { UserLogoutReq, UserLogoutRes } from 'common-lib/api/user/logout';
import { sessionManager } from '../../session-manager';
import { succeed, tryResponse } from '../../api-helper';
import { cors } from '../../cors';

createApi<UserLogoutReq, UserLogoutRes>(
    '/user/logout',
    (req, res) => {
        tryResponse(res, () => {
            const { sessionToken } = req.body;
            sessionManager.logout(sessionToken);
            succeed(res);
        });
    },
    [cors],
);
