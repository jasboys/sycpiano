import * as dotenv from 'dotenv';

dotenv.config({ override: true });

const smtpEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
];

const prodVars = ['PARTIALS_DIR'];

const required = [
    'PORT',
    'HOST',
    'GAPI_KEY_SERVER',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_KEY',
    'COOKIE_SECRET',
    'PRODUCTS_DIR',
    'GAPI_CLIENT_EMAIL',
    'GAPI_PRIVATE_KEY',
    ...(process.env.USE_DUMMY_MAILER !== 'true' ? smtpEnvVars : []),
    ...(process.env.NODE_ENV === 'production' ? prodVars : []),
];

export const precheck = async () => {
    // Check DB stuff
    if (!process.env.DATABASE_URL) {
        const dbRequired = ['DB_USER', 'DB_PASS'];
        for (const key of dbRequired) {
            const value = process.env[key];
            if (!value) {
                throw Error(`${key} is not defined, nor DB_URL`);
            }
        }
    }
    for (const key of required) {
        const value = process.env[key];
        if (!value) {
            throw Error(`${key} is not defined.`);
        }
    }

    return Promise.resolve();
};
