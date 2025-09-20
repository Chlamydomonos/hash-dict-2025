import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingEmbedAllReq = LoginReq<{}>;
export type EmbeddingEmbedAllRes = WithFailReason<{}, FailReasonLogin>;
