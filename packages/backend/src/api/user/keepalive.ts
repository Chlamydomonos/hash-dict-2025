import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import { type UserKeepaliveReq, type UserKeepaliveRes } from 'common-lib/api/user/keepalive';

createApi<UserKeepaliveReq, UserKeepaliveRes>('/user/keepalive', async (req, res) => {
    await tryResponse(res, async () => {
        const user = await needLogin(req, res);
        if (!user) {
            return;
        }
        succeed(res);
    });
});
