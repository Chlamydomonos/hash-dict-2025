import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordCreateTypeReq = LoginReq<{
    end: string;
    description: string;
}>;

export type WordCreateTypeRes = WithFailReason<
    {
        id: number;
    },
    FailReasonLogin<'exists' | 'illegal'>
>;
