import { FailReason, WithFailReason } from '../../api-lib/type-helper';

export type UserRegisterReq = {
    name: string;
    passwordHash: string;
};

export type UserRegisterRes = WithFailReason<{}, FailReason<'exists'>>;
