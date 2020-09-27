import {ResponseRequestBody} from './Model';

export class ApiClient {

    constructor() {
    }

    sendForm(formId: number, data: ResponseRequestBody): Promise<unknown> {

        return fetch(`/api/form/${formId}/response`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(d => d.json());
    }
}
