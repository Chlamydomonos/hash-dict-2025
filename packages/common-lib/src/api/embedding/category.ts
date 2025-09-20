import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type EmbeddingCategoryReq = { id: number };
export type EmbeddingCategoryRes = WithFailReason<{ embedded: boolean }, FailReason<'not_exists'>>;
