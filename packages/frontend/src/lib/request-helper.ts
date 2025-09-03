import { useSessionStore } from '@/stores/session';
import { request, type ReqDict } from './request';
import { storeToRefs } from 'pinia';
import type { AxiosRequestConfig } from 'axios';

type LoginReqDict = {
    [K in keyof ReqDict as ReqDict[K] extends { req: { sessionToken: string } } ? K : never]: ReqDict[K];
};

export class NotLoggedInError extends Error {
    constructor() {
        super('Not logged in');
    }
}

const loginFromCache = async () => {
    const { loggedIn, userName, passwordHash, sessionToken } = storeToRefs(useSessionStore());
    if (!userName.value || !passwordHash.value) {
        throw new NotLoggedInError();
    }

    const response = (
        await request('/user/login', {
            name: userName.value,
            passwordHash: passwordHash.value,
        })
    ).data;
    if (!response.success) {
        throw new NotLoggedInError();
    }

    sessionToken.value = response.sessionToken;
    loggedIn.value = true;
};

export const loginRequest = async <T extends keyof LoginReqDict>(
    path: T,
    req: Omit<LoginReqDict[T]['req'], 'sessionToken'>,
    headers?: AxiosRequestConfig['headers'],
) => {
    const { loggedIn, sessionToken } = storeToRefs(useSessionStore());
    if (!loggedIn.value) {
        await loginFromCache();
    }

    const res = await request(path, { ...req, sessionToken: sessionToken.value! }, headers);
    if (res.data.success || res.data.reason != 'not_logged_in') {
        return res;
    } else if (!res.data.success) {
        loggedIn.value = false;
        await loginFromCache();
        const newRes = await request(path, { ...req, sessionToken: sessionToken.value! }, headers);
        if (newRes.data.success || newRes.data.reason != 'not_logged_in') {
            return newRes;
        }
    }

    throw new NotLoggedInError();
};
