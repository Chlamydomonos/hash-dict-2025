import type { Request, Response } from 'express';
import type { TupleToObject } from 'common-lib/typings/tuple-to-object';
import type { UnionToTuple } from 'common-lib/typings/union-to-tuple';
import { sessionManager } from './session-manager';
import { User } from './db/models/User';
import { Transaction } from '@sequelize/core';

type ResBody<T extends Response> = T extends Response<infer U> ? U : never;

type UnionToObject<T> = TupleToObject<UnionToTuple<T>>;

type ParseSuccessParam<T, S, O extends string> = T extends { success: S } ? Omit<T, 'success' | O> : never;

type ValueOf<T> = T[keyof T];

type ExtractSuccessParams<T> = {
    [key in keyof UnionToObject<T>]: ParseSuccessParam<UnionToObject<T>[key], true, never>;
};

type ExtractReasonParams<T> = {
    [key in keyof UnionToObject<T>]: ParseSuccessParam<UnionToObject<T>[key], false, 'reason'>;
};

export const succeed = <T extends Response>(res: T, data?: ValueOf<ExtractSuccessParams<ResBody<T>>>) => {
    res.send({ success: true, ...data } as any);
};

export const fail = <T extends Response>(
    res: T,
    reason: ResBody<T> extends { success: true } | { success: false; reason: infer U } ? U : never,
    data?: ValueOf<ExtractReasonParams<ResBody<T>>>,
) => {
    res.send({ success: false, reason, ...data } as any);
};

type Contains<Union, Target> = [Target] extends [never]
    ? false
    : (Union extends any ? (Target extends Union ? true : never) : never) extends never
      ? false
      : true;

export const needLogin = async <Res extends Response, Req extends Request>(
    req: Req['body'] extends { sessionToken: string } ? Req : never,
    res: ResBody<Res> extends { success: true } | { success: false; reason: infer U }
        ? Contains<U, 'not_logged_in'> extends true
            ? Res
            : never
        : never,
    extra?: {
        data?: ValueOf<ExtractReasonParams<ResBody<Res>>>;
        transaction?: Transaction;
    },
) => {
    const userInfo = sessionManager.validateSession(req.body.sessionToken);
    if (!userInfo) {
        res.send({ success: false, reason: 'not_logged_in', ...extra?.data });
        return undefined;
    }

    const user = await User.findByPk(userInfo.id, { transaction: extra?.transaction });
    if (!user) {
        sessionManager.logoutAllUserSessions(userInfo.id);
        res.send({ success: false, reason: 'not_logged_in', ...extra?.data });
        return undefined;
    }

    return user;
};

export const tryResponse = async <T extends Response>(
    res: ResBody<T> extends { success: true } | { success: false; reason: infer U }
        ? Contains<U, 'unknown'> extends true
            ? T
            : never
        : never,
    handler: (() => void) | (() => Promise<void>),
) => {
    try {
        await handler();
    } catch (e) {
        fail(res, 'unknown' as any);
    }
};
