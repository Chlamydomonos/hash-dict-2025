import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingMyClientsReq = LoginReq<{}>;

export type EmbeddingMyClientsRes = WithFailReason<{ count: number; total: number }, FailReasonLogin>;
