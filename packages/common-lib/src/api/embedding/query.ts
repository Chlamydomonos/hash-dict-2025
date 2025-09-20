import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingQueryReq = LoginReq<{ text: string }>;
export type EmbeddingQueryRes = WithFailReason<
    {
        data: {
            type: { id: number; end: string };
            data: { id: number; value: string }[];
        }[];
    },
    FailReasonLogin<'no_client' | 'embedding'>
>;
