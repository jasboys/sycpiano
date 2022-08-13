import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize/types';
dotenv.config();

const config = () => {
    let username: string;
    let password: string;
    let host: string;
    let database: string;
    let port: number;
    const dbUrl = process.env.DB_URL;
    if (dbUrl) {
        let portString;
        const match = dbUrl.match(/postgres:\/\/(.+):(.+)@(.+):(.+)\/(.+)/);
        if (match === null) {
            throw new Error('database url is improperly formed');
        }
        [
            ,
            username,
            password,
            host,
            portString,
            /* tslint:disable-next-line:trailing-comma */
            database
        ] = match;
        port = parseInt(portString, 10);
    } else {
        username = process.env.DB_USER;
        password = process.env.DB_PASS;
        host = process.env.DB_HOST || '127.0.0.1';
        database = process.env.DB_NAME;
        port = parseInt(process.env.DB_PORT || '5432', 10);
    }
    return {
        username,
        password,
        host,
        database,
        port,
        dialect: 'postgres' as Dialect,
        logging: () => { return; },
        define: { freezeTableName: true, underscored: true },
    };
};

export const development = {
    ...config(),
    logging: (str: string) => {
        console.log(str);
    }
}
export const test = config();
export const production = config();
