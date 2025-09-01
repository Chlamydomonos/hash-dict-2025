import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordListTypesReq = {};

export type WordListTypesRes = WithFailReason<
    {
        data: { id: number; end: string }[];
    },
    FailReason
>;
