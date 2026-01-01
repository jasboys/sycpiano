import * as dotenv from 'dotenv';

dotenv.config({ override: true });

const config = {
    databaseUrl: `${process.env.DATABASE_URL}&encoding=utf8`,
};

export default config;
