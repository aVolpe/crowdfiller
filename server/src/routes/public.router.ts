import pg from 'pg';
import express from 'express';
import {handle} from '../utils';
import {PublicFormService} from '../services/FormService';
import {ApiError} from '../exceptions';


/**
 * We define a public router (i.e. a router that doesn't requires auth)
 */
export function buildPublicRouter(db: pg.Pool) {

    const router = express.Router();

    /**
     * GET to get a form with default data
     */
    router.post('/form/:formId/response', handle(req => {
        const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
        return new PublicFormService(db).getForm(formId, req.body);
    }));

    /**
     * GET to get a form with empty data
     */
    router.get('/form/:formId/response', handle(req => {
        const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
        return new PublicFormService(db).getForm(formId);
    }));

    /**
     * SUBMIT a response
     */
    router.put('/form/:formId/response', handle(req => { 
        const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
        new PublicFormService(db).submitForm(formId, req.body);
    }));

    router.put('/login'

    /**
     * Validates that a value is a non empty string
     */
    function validateIsStringAndNotEmpty(resourceName: string, val: unknown): string {
        if (!val || typeof val !== 'string' || val.trim() === '') {
            throw new ApiError(`invalid.${resourceName}`, 409, {val});
        }
        return val;
    }

    return router;
}
