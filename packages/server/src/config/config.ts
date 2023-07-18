import * as dotenv from 'dotenv';
dotenv.config({ override: true });

const config = {
    databaseUrl: process.env.DATABASE_URL,
};

export default config;
