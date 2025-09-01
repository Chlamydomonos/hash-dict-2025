import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordListReq = {
    typeId: number;
    parentId: number | null;
    start: number;
    limit: number;
};

export type WordListRes = WithFailReason<
    { data: { id: number; value: string }[] },
    FailReason<'type_not_exists' | 'parent_not_exists'>
>;
