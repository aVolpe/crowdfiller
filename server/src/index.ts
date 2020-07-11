import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pg from 'pg';
import {buildPublicRouter} from './routes/public.router';

const port = process.env.PORT || 3000

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());


const db = new pg.Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'crowdfiller',
    password: process.env.PGPASSWORD || 'crowdfiller',
    database: process.env.PGDATABASE || 'crowdfiller'

})



server.use('/api/', buildPublicRouter(db));

server.listen(port, () => console.log(`API listening at http://localhost:${port}`))

// PUBLIC ENDPOINTS

// POST to get a form with default data
