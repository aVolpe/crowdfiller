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
    connectionString: process.env.PGCONN || `postgres://crowdfiller:crowdfiller@localhost:5432/crowdfiller`
})




server.listen(port, () => console.log(`API listening at http://localhost:${port}`))

// PUBLIC ENDPOINTS
server.use('/api/', buildPublicRouter(db));

