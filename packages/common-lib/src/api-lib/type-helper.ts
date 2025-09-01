export type WithFailReason<
    SuccessType extends Record<string, any>,
    FailReason,
    FailType extends Record<string, any> = {},
> = ({ success: true } & SuccessType) | ({ success: false; reason: FailReason } & FailType);

export type FailReason<T extends string = never> = T | 'unknown';

export type FailReasonLogin<T extends string = never> = T | 'not_logged_in' | 'unknown';

export type WithFailReasons<
    SuccessType extends Record<string, any>,
    Reasons extends { reason: string; data: Record<string, any> }[],
> =
    | ({ success: true } & SuccessType)
    | ({ success: false } & {
          [K in keyof Reasons]: { reason: Reasons[K]['reason'] } & Reasons[K]['data'];
      }[number]);

export type LoginReq<T extends Record<string, any>> = { sessionToken: string } & T;
