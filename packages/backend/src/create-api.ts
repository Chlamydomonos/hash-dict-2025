import type { Request, RequestHandler, Response } from 'express';
import { log, logError } from './log';

export const createApi = <Req, Res>(
    path: string,
    handler: (req: Request<Record<string, any>, Res, Req>, res: Response<Res>) => void,
    middlewares?: RequestHandler[],
) => {
    const finalHandler = async (req: Request, res: Response) => {
        try {
            log('POST', path);
            await handler(req, res);
        } catch (e) {
            logError('Unhandled error:', e);
            res.status(500).send('Internal server error');
        }
    };

    if (middlewares) {
        app.post(path, ...middlewares, finalHandler);
    } else {
        app.post(path, finalHandler);
    }
};
