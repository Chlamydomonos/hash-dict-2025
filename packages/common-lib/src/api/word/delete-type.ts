import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordDeleteTypeReq = LoginReq<{
    id: number;
}>;

export type WordDeleteTypeRes = WithFailReason<{}, FailReasonLogin>;
