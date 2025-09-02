import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type WordFindReq = {
    word: string;
};

export type WordFindRes = WithFailReason<
    {
        type: { id: number; end: string };
        categories: { id: number; value: string }[];
    },
    FailReason<'illegal' | 'not_exists'>
>;
