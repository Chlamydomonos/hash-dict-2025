import { FailReasonLogin, LoginReq, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingProgressReq = LoginReq<{}>;

export type EmbeddingProgressRes = WithFailReason<
    {
        inProgress: boolean;
        embedded: number;
        total: number;
        error?: string;
    },
    FailReasonLogin
>;
