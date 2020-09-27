export interface ResponseRequestBody {
    source: string;
    data: unknown;
}

export interface ResponseResultBody {
    responseId: string;
}


export type FormIframeEvents = {
    __crowdfiller_evt_name: 'CROWDFILLER_DO_SUBMIT'
} | {
    __crowdfiller_evt_name: 'CROWDFILLER_SUBMITTED',
    payload: {
        response: string
    }
} | {
    __crowdfiller_evt_name: 'CROWDFILLER_VALIDATION_ERROR',
    payload: {
        errors: unknown
    }
}
