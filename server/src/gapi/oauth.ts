import { JWT } from 'google-auth-library';
import orm from '../database.js';
import { Token } from '../models/Token.js';

const authorize = async () => {
    const jwt = new JWT(
        process.env.GAPI_CLIENT_EMAIL,
        undefined,
        process.env.GAPI_PRIVATE_KEY,
        ['https://www.googleapis.com/auth/calendar'],
        undefined,
    );

    try {
        const response = await jwt.authorize();
        return response;
    } catch (e) {
        console.log(e);
    }
};

export const getToken = async (): Promise<string> => {
    const tokenInstance = await orm.em.findOne(Token, { id: 'access_token' });
    if (tokenInstance) {
        const expired = (tokenInstance.expires === undefined) ? undefined : Date.now() > tokenInstance.expires.valueOf();
        if (expired !== undefined && !expired) {
            return tokenInstance.token;
        }
    }
    const credentials = await authorize();
    // appease the strict gods
    if (
        credentials === undefined ||
        credentials.access_token === undefined ||
        credentials.access_token === null ||
        credentials.expiry_date === undefined ||
        credentials.expiry_date === null
    ) {
        throw new Error('Not authorized, or no expiry date');
    }
    await orm.em.upsert(
        Token,
        {
            id: 'access_token',
            token: credentials.access_token,
            expires: new Date(credentials.expiry_date),
        }
    );
    await orm.em.flush();

    return credentials.access_token;
};
