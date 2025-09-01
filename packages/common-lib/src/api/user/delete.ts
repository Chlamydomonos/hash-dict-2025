import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserDeleteReq = LoginReq<{ names: string[] }>;

export type UserDeleteRes = WithFailReason<{}, FailReasonLogin>;
