import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordCategoryReq = {
    id: number;
};

export type WordCategoryRes = WithFailReason<
    {
        value: string;
        description: string;
    },
    FailReason<'not_exists'>
>;
