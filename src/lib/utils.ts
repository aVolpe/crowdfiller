import {ApiError} from './exceptions';
import {NextApiRequest, NextApiResponse} from 'next'
import {getErrorInfo} from './client_utils';

/**
 * Takes function that can trow errors, can be async, and wraps it in a express response handler.
 *
 * All errors will be handled.
 *
 * If the function returns a promise, the promise will be resolved and the result will be returned
 * with a 200 status.
 *
 * If a ApiError is throwed, the message will be printed and a appropiate reponse will be send.
 */
export function handle(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | object | void) {
    return (req: NextApiRequest, res: NextApiResponse) => {
        if (!fn) return;
        handlePromise(res, () => fn(req, res))
            .catch(err => handleError(err, res));
    }
}

async function handlePromise(
    res: NextApiResponse,
    prom: () => Promise<unknown> | void | object
) {
    try {
        const response = prom();
        if (response instanceof Promise) {
            const body = await response;
            res.send(body);
        } else {
            res.send(response);
        }
    } catch (e) {
        handleError(e, res);
    }
}

function handleError(err: unknown, res: NextApiResponse) {

    const dat = getErrorInfo(err);
    if (dat.code === 500) console.warn('Error in API, check console ', err);

    res.status(dat.code).send({reason: dat.msg, code: dat.code, meta: dat.meta});
}




export function validateIsStringAndNotEmpty(resourceName: string, val: unknown): string {
    if (!val || typeof val !== 'string' || val.trim() === '') {
        throw new ApiError(`invalid.${resourceName}`, 409, {val});
    }
    return val;
}


