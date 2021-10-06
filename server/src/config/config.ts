import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize/types';
dotenv.config();

export const development = {
    host: '127.0.0.1',
    database: 'sycpiano',
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: 'postgres' as Dialect,
    logging: (str: string): void => {
        console.log(str);
    },
    define: { freezeTableName: true, underscored: true },
};

const config = () => {
    let username: string;
    let password: string;
    let host: string;
    let database: string;
    let port: number;
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        let portString;
        [
            ,
            username,
            password,
            host,
            portString,
            /* tslint:disable-next-line:trailing-comma */
            database
        ] = dbUrl.match(/postgres:\/\/(.+):(.+)@(.+):(.+)\/(.+)/);
        port = parseInt(portString, 10);
    } else {
        username = process.env.DB_USER;
        password = process.env.DB_PASS;
        host = process.env.DB_HOST;
        database = process.env.DB_NAME;
        port = parseInt(process.env.DB_PORT, 10);
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

export const test = config();
export const production = config();
