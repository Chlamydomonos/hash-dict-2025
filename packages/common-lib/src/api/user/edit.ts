import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserEditReq = LoginReq<{ name?: string; passwordHash?: string }>;

export type UserEditRes = WithFailReason<{}, FailReasonLogin<'exists'>>;
