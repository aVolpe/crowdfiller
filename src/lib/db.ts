import pg from 'pg';

export const db = new pg.Pool({
    connectionString: process.env.PGCONN || `postgres://crowdfiller:crowdfiller@localhost:5432/crowdfiller`
})
