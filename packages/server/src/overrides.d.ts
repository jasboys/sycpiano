declare namespace Express {
    interface Request {
        role: (typeof UserRoles)[number];
    }
}

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        SMTP_PORT: string;
        SMTP_HOST: string;
        SMTP_USERNAME: string;
        SMTP_PASSWORD: string;
        EMAIL_DOMAIN: string;
        DKIM_PRIVATE_KEY_FILE: string;
        IMAGE_ASSETS_DIR: string;
        MUSIC_ASSETS_DIR: string;
        PARTIALS_DIR: string;
        SCRIPTS_DIR: string;
        PRODUCTS_DIR: string;
        DATABASE_URL: string;
        DB_USER: string;
        DB_PASS: string;
        DB_HOST: string;
        DB_NAME: string;
        DB_PORT: string;
        SEED_DATA_DIR: string;
        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_KEY: string;
        PUBLIC_HOST: string;
        GAPI_CLIENT_EMAIL: string;
        GAPI_PRIVATE_KEY: string;
        DEV_HTTPS_PORT: string;
        PORT: string;
        HOST: string;
    }
}
