import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type UserKeepaliveReq = LoginReq<{}>;

export type UserKeepaliveRes = WithFailReason<{}, FailReasonLogin>;
