import pg from 'pg';
import {ResourceNotFoundError, ApiError} from 'src/exceptions';
import Ajv from 'ajv';
import deepmerge from 'deepmerge';

export class PublicFormService {

    constructor(private db: pg.Pool) {
    }

    async getForm(id: string, currentData?: unknown) {

        const form = await this.loadForm(id);
        let data = form.data || {};
        if (currentData && typeof currentData === 'object') {
            
            const ajv = new Ajv();
            const valid = ajv.validate(form.schema, currentData);
            if (!valid) { 
                // TODO throw real error
                throw new ApiError('form.invalid.defData', 409, { def: currentData, errors: ajv.errors });
            }
            data = deepmerge(data, currentData);

        }

        return {
            id,
            schema: form.schema,
            data,
            formVersion: form.version
        }
    }

    async submitForm(id: string, body: unknown) {


        if (!body || typeof body !== 'object') {
            throw new ApiError('form.invalid.body', 409, { body });
        }

        const form = await this.loadForm(id);
        const ajv = new Ajv();
        const valid = ajv.validate(form.schema, body);
        if (!valid) { 
            // TODO throw real error
            console.log(ajv.errors);
            throw new ApiError('form.invalid.form', 409, { body, errros: ajv.errors });
        }

        const QUERY = `INSERT INTO responses (form_id, form_version, data) VALUES ($1, $2, $3) RETURNING *`;
        try {
            const queryResult = await this.db.query(QUERY, [form.id, form.version, body]);

            return {
                responseId: queryResult.rows[0].id
            }
        } catch (err) {
            console.warn(err);
            throw new ApiError('internal.server.error', 500, { id, body });
        }

    }

    private async loadForm(id: string): Promise<{ id: string, schema: object, data: object | undefined, version: number }> {

        const QUERY = `SELECT version, schema, def FROM forms WHERE id = $1`;
        const queryResult = await this.db.query(QUERY, [id])

        if (!queryResult.rows.length) {
            throw new ResourceNotFoundError('form', id);
        }

        const schema = queryResult.rows[0].schema;
        let data = queryResult.rows[0].def;
        return { id, schema, data, version: queryResult.rows[0].version };
    }

}
