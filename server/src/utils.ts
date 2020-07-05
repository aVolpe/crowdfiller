import express from 'express';
import {ApiError} from './exceptions';

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
export function handle(fn: (req: express.Request, res: express.Response) => Promise<unknown> | object | void) {
    return (req: express.Request, res: express.Response) => {
        if (!fn) return;
        handlePromise(res, () => fn(req, res))
            .catch(err => handleError(err, res));
    }
}

async function handlePromise(
    res: express.Response,
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

function handleError(err: unknown, res: express.Response) {
    if (err instanceof ApiError) {
        console.warn('Error in API, check console ', err.meta, err);
        res.status(err.code || 500).send({reason: err.message || 'Unexpected error', meta: err.meta})
    } else {
        console.warn('Error in API, check console ', err);
        res.status(500).send({reason: 'Unexpected error, check console'})
    }
}
