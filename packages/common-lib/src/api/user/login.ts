import { FailReason, WithFailReason } from '../../api-lib/type-helper';
import { UserRegisterReq } from './register';

export type UserLoginReq = UserRegisterReq;

export type UserLoginRes = WithFailReason<
    {
        sessionToken: string;
    },
    FailReason<'not_exists' | 'wrong_password' | 'invalid'>
>;
