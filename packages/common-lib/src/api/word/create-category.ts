import { FailReasonLogin, LoginReq, WithFailReasons } from '../../api-lib/type-helper';

export type WordCreateCategoryReq = LoginReq<{
    parentId: number | null;
    typeId: number;
    value: string;
    description: string;
}>;

export type WordCreateCategoryRes = WithFailReasons<
    {
        id: number;
    },
    [
        {
            reason: FailReasonLogin<'type_not_exists' | 'parent_not_exists' | 'illegal' | 'illegal_reserved'>;
            data: {};
        },
        {
            reason: 'reserved';
            data: { nextReserved: string };
        },
        {
            reason: 'prefix';
            data: { prefixes: string[] };
        },
    ]
>;
