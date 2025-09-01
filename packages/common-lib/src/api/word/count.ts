import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordCountReq = {
    typeId: number;
    parentId: number | null;
};

export type WordCountRes = WithFailReason<{ count: number }, FailReason<'type_not_exists' | 'parent_not_exists'>>;
