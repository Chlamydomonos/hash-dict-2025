import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserCountReq = LoginReq<{
    filter?: 'valid' | 'invalid';
}>;

export type UserCountRes = WithFailReason<
    {
        count: number;
    },
    FailReasonLogin
>;
