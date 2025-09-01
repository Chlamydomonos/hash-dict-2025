import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordDeleteCategoryReq = LoginReq<{
    id: number;
}>;

export type WordDeleteCategoryRes = WithFailReason<{}, FailReasonLogin>;
