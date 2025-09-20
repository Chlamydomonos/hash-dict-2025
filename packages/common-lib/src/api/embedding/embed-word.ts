import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingEmbedWordReq = LoginReq<{ id: number }>;
export type EmbeddingEmbedWordRes = WithFailReason<
    {},
    FailReasonLogin<'not_exists' | 'no_client' | 'embed_all_in_progress'>
>;
