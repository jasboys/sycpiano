import { JWT } from 'google-auth-library';
import { token } from '../models/token';
import * as Sequelize from 'sequelize';

/* eslint-disable-next-line @typescript-eslint/no-var-requires*/
const authInfo = require('../../gapi-key.json');

const authorize = async () => {
    const jwt = new JWT(
        authInfo.client_email,
        undefined,
        authInfo.private_key,
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

export const getToken = async (sequelize: Sequelize.Sequelize): Promise<string> => {
    const tokenModel = sequelize.models.token as Sequelize.ModelStatic<token>;
    const tokenInstance = await tokenModel.findByPk('access_token');
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
    await tokenModel.upsert({
        id: 'access_token',
        token: credentials.access_token,
        expires: new Date(credentials.expiry_date),
    });

    return credentials.access_token;
};
