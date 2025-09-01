import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordFindReq = {
    word: string;
};

export type WordFindRes = WithFailReason<
    {
        data: { id: number; value: string }[];
    },
    FailReason<'illegal' | 'not_exists'>
>;
