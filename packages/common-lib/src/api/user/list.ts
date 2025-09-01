import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserListReq = LoginReq<{
    start: number;
    limit: number;
    filter?: 'valid' | 'invalid';
}>;

export type UserListRes = WithFailReason<
    {
        data: { id: number; name: string; valid: boolean }[];
    },
    FailReasonLogin
>;
