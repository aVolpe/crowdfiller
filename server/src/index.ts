import express from 'express';
import helmet from 'helmet';
import pg from 'pg';
import cors from 'cors';
import {ApiError} from './exceptions';
import {PublicFormService} from './services/FormService';
import {handle} from './utils'; 

const port = process.env.PORT || 3000

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


const db = new pg.Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'crowdfiller',
    password: process.env.PGPASSWORD || 'crowdfiller',
    database: process.env.PGDATABASE || 'crowdfiller'

})


app.listen(port, () => console.log(`API listening at http://localhost:${port}`))

// PUBLIC ENDPOINTS

// POST to get a form with default data
app.post('/api/form/:formId/response', handle(req => {
    const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
    return new PublicFormService(db).getForm(formId, req.body);
}));

// GET to get a form with empty data
app.get('/api/form/:formId/response', handle(req => {
    const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
    return new PublicFormService(db).getForm(formId);
}));

// SUBMIT a response
app.put('/api/form/:formId/response', handle(req => { 
    const formId = validateIsStringAndNotEmpty('formId', req.params.formId);
    new PublicFormService(db).submitForm(formId, req.body);
}));

function validateIsStringAndNotEmpty(resourceName: string, val: unknown): string {
    if (!val || typeof val !== 'string' || val.trim() === '') {
        throw new ApiError(`invalid.${resourceName}`, 409, {val});
    }
    return val;
}
