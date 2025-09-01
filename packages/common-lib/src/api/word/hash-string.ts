import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type WordHashStringReq = LoginReq<{
    typeId: number;
    parentId: number | null;
    original: string;
}>;

export type WordHashStringRes = WithFailReason<
    {
        value: string;
    },
    FailReasonLogin<'type_not_exists' | 'parent_not_exists' | 'hash_full'>
>;
