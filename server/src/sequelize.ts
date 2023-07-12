import { Sequelize } from 'sequelize';
import * as Config from './config/config';

const config = (process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test') ? Config.production : Config.development;

const {
    database,
    username,
    password,
    host,
    port,
    dialect,
    logging,
    define,
} = config;

export const options = {
    database,
    username,
};

export default new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    dialectOptions: {
        charSet: 'utf8',
        collate: 'utf8_unicode_ci',
        client_encoding: 'utf8',
    },
    pool: { max: 5, min: 0, idle: 10000 },
    define,
    logging,                 // change to log to output
});
