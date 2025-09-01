import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordDailyReq = {};

export type WordDailyRes = WithFailReason<
    {
        data: {
            type: { id: number; end: string };
            data: { id: number; value: string }[];
        }[];
    },
    FailReason
>;
