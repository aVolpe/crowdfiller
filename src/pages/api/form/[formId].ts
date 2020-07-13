import { NextApiRequest } from 'next'
import { PublicFormService } from '../../../lib/services/FormService';
import { db } from '../../../lib/db';
import {validateIsStringAndNotEmpty, handle} from '../../../lib/utils';
import {ApiError} from 'next/dist/next-server/server/api-utils';

export default handle(async (req: NextApiRequest) => {

    const formId = validateIsStringAndNotEmpty('formId', req.query.formId);
    const service = new PublicFormService(db);
    switch (req.method) {
        case 'GET':
        case 'POST':
            return await service.getForm(formId, req.body);
        default:
            throw new ApiError(409, 'Method not supported');
    }
});


