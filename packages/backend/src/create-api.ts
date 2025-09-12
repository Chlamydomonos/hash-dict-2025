import type { Request, Response } from 'express';
import { log, logError } from './log';

export const createApi = <Req, Res>(
    path: string,
    handler: (req: Request<Record<string, any>, Res, Req>, res: Response<Res>) => void,
) => {
    app.post(path, async (req, res) => {
        try {
            log('POST', path);
            await handler(req, res);
        } catch (e) {
            logError('Unhandled error:', e);
            res.status(500).send('Internal server error');
        }
    });
};
