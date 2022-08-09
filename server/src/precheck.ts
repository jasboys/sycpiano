import * as dotenv from 'dotenv';
import { umzug } from './migrate';

dotenv.config();

const required = [
    'PORT',
    'ADMIN_PORT',
    'HOST',
    'GAPI_KEY_SERVER',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_KEY',
    'COOKIE_SECRET',
    'PRODUCTS_DIR',
    'DKIM_PRIVATE_KEY_FILE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD'
];

export const precheck = async () => {
    // Check DB stuff
    if (!process.env.DB_URL) {
        const dbRequired = ['DB_USER', 'DB_PASS'];
        dbRequired.forEach((key) => {
            const value = process.env[key];
            if (!value) {
                throw Error(`${key} is not defined, nor DB_URL`);
            }
        });
    }
    required.forEach((key) => {
        const value = process.env[key];
        if (!value) {
            throw Error(`${key} is not defined.`);
        }
    });

    // run migrations!
    await umzug.up();
};
