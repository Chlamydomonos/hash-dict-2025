import { FailReasonLogin, LoginReq, WithFailReasons } from '../../api-lib/type-helper';

export type UserValidateReq = LoginReq<{
    ids: number[];
}>;

export type UserValidateRes = WithFailReasons<
    {},
    [
        {
            reason: FailReasonLogin;
            data: {};
        },
        {
            reason: 'not_exists';
            data: {
                ids: number[];
            };
        },
    ]
>;
