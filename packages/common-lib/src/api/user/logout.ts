import { FailReason, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserLogoutReq = LoginReq<{}>;

export type UserLogoutRes = WithFailReason<{}, FailReason>;
