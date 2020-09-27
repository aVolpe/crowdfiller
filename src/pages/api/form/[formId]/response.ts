import {NextApiRequest} from 'next'
import {PublicFormService} from '../../../../lib/services/FormService';
import {db} from '../../../../lib/db';
import {handle, validateIsStringAndNotEmpty, validateIsValidJson} from '../../../../lib/utils';
import {ApiError} from 'next/dist/next-server/server/api-utils';
import {ResponseRequestBody} from '../../../Model';

export default handle(async (req: NextApiRequest) => {

    const formId = validateIsStringAndNotEmpty('formId', req.query.formId);
    const service = new PublicFormService(db);
    switch (req.method) {
        case 'POST':
            const body = validateIsValidJson('body', req.body);
            return await service.submitForm(formId, body as ResponseRequestBody);
        default:
            throw new ApiError(409, 'Method not supported');
    }
});


