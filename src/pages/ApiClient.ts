import {ResponseRequestBody, ResponseResultBody} from './Model';

export class ApiClient {

    constructor() {
    }

    sendForm(formId: number, data: ResponseRequestBody): Promise<ResponseResultBody> {

        return fetch(`/api/form/${formId}/response`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(d => d.json());
    }
}
