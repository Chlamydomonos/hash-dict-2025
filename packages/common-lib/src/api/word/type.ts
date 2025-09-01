import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordTypeReq = {
    id: number;
};

export type WordTypeRes = WithFailReason<
    {
        end: string;
        description: string;
    },
    FailReason<'not_exists'>
>;
