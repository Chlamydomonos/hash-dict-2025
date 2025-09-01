import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordEditTypeReq = LoginReq<{
    id: number;
    description: string;
}>;

export type WordEditTypeRes = WithFailReason<{}, FailReasonLogin<'not_exists'>>;
