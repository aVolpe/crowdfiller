import {ApiError} from './exceptions';

export function getErrorInfo(err: unknown): ErrorInfo {
    if (err instanceof ApiError) {
        return {code: err.code || 500, msg: err.message || 'Unexpected error', meta: err.meta};
    }

    if (err.hasOwnProperty('statusCode') && err.hasOwnProperty('message')) {
        const withStatus = err as any;
        return {code: withStatus.statusCode || 500, msg: withStatus.message || 'Unexpected error'};
    }
    console.warn('Error in API, check console ', err);
    return {code: 500, msg: 'Unexpected error'};
}

export interface ErrorInfo {
    code: number;
    msg: string;
    meta?: unknown;
}

export function isErrorInfo(data: ErrorInfo | any): data is ErrorInfo {
    const asErr = data as ErrorInfo;
    return asErr.code !== undefined
        && asErr.msg !== undefined;
}
