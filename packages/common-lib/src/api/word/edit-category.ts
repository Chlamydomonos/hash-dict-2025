import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordEditCategoryReq = LoginReq<{
    id: number;
    description: string;
}>;

export type WordEditCategoryRes = WithFailReason<{}, FailReasonLogin<'not_exists'>>;
