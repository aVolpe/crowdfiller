import pg from 'pg';
import {ApiError, ResourceNotFoundError} from '../exceptions';
import Ajv from 'ajv';
import deepmerge from 'deepmerge';
import {JSONSchema7} from 'json-schema';
import {ResponseRequestBody} from '../../pages/Model';

export class PublicFormService {

    constructor(private db: pg.Pool) {
    }

    async getForm(id: string, currentData?: unknown): Promise<FormWithData> {

        const form = await this.loadForm(id);
        let data = form.data || {};
        if (currentData && typeof currentData === 'object') {

            //const ajv = new Ajv();
            //const valid = ajv.validate(form.schema, currentData);
            //if (!valid) { 
            //// TODO throw real error
            //throw new ApiError('form.invalid.defData', 409, { def: currentData, errors: ajv.errors });
            //}
            data = deepmerge(data, currentData);

        }

        return {
            id: parseInt(id),
            version: form.version,
            data,
            schema: form.schema,
        }
    }

    async submitForm(id: string, body: ResponseRequestBody) {

        if (!body || typeof body !== 'object'
            || !body.data || typeof body.data !== 'object'
        ) {
            throw new ApiError('form.invalid.body', 409, {body});
        }

        if (!body.source) {
            console.warn(`Form submission without source, ${id}`, body)
        }

        const form = await this.loadForm(id);
        const ajv = new Ajv();
        const valid = ajv.validate(form.schema, body.data);
        if (!valid) {
            throw new ApiError('form.invalid.form', 409, {body, errors: ajv.errors});
        }

        const QUERY = `INSERT INTO response (form_id, form_version, data, source)
                       VALUES ($1, $2, $3, $4)
                       RETURNING *`;
        try {
            const queryResult = await this.db.query(QUERY, [form.id, form.version, body.data, body.source || null]);

            return {
                responseId: queryResult.rows[0].id
            }
        } catch (err) {
            console.warn(err);
            throw new ApiError('internal.server.error', 500, {id, body});
        }

    }

    private async loadForm(id: string): Promise<{ id: string, schema: object, data: object | undefined, version: number }> {

        const QUERY = `SELECT version, schema, def
                       FROM form
                       WHERE id = $1`;
        const queryResult = await this.db.query(QUERY, [id])

        if (!queryResult.rows.length) {
            throw new ResourceNotFoundError('form', id);
        }

        const schema = queryResult.rows[0].schema;
        let data = queryResult.rows[0].def;
        return {id, schema, data, version: parseInt(queryResult.rows[0].version)};
    }

}

export interface FormWithData {
    id: number;
    version: number;
    data: unknown;
    schema: JSONSchema7;
}
