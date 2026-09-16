import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import * as express from 'express';
import { upperCase } from 'lodash-es';
import { LocalProtocol } from 'paseto';
import {
    DecryptFactory,
    EncryptFactory,
    ExportKeyFactory,
    GenerateKeyFactory,
    ImportKeyFactory,
} from 'paseto/v3/local';
import validator from 'validator';

import orm from './database.js';
import { mailer } from './emails/index.js';
import { User } from './models/User.js';
import * as stripeClient from './stripe.js';

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

export const authorize = async (user: string) => {
    try {
        const v3 = new LocalProtocol(
            GenerateKeyFactory,
            EncryptFactory,
            ExportKeyFactory,
        );
        const key = await v3.GenerateKey({ extractable: true });
        const token = await v3.Encrypt(key, {
            sub: user,
            expiresIn: '24h',
            aud: 'seanchenpiano.com',
            iss: 'seanchenpiano.com',
        });
        const serialized = await v3.ExportKey(key);
        return { token, key: serialized };
    } catch (e) {
        console.log(e);
        throw e;
    }
};

enum Role {
    ADMIN = 'admin',
    READONLY = 'readonly',
    CUSTOMER = 'customer',
}

type HandlerWithRole = express.RequestHandler<
    unknown,
    unknown,
    unknown,
    unknown,
    { role: Role }
>;

const isK3Local = (v: string): v is `k3.local.${string}` => {
    return v.startsWith('k3.local.');
};

export const authAndGetRole: HandlerWithRole = async (req, res, next) => {
    if (ignoredMethods.includes(req.method)) {
        return next();
    }
    try {
        const accessToken = req.cookies.access_token;
        const session = req.cookies.id;
        if (!accessToken || !session) {
            throw new Error('No cookie');
        }
        const split = accessToken.split(' ');
        if (split.length !== 2 || split[0] !== 'Bearer') {
            throw new Error('Wrong format');
        }
        const token: string = split[1];
        const user = await orm.em.findOneOrFail(User, { session });
        if (
            typeof user.pasetoSecret !== 'string' ||
            typeof user.username !== 'string' ||
            typeof user.role !== 'string'
        ) {
            throw new Error('No paseto secret or user');
        }
        const v3 = new LocalProtocol(DecryptFactory, ImportKeyFactory);
        if (isK3Local(user.pasetoSecret)) {
            const key = await v3.ImportKey(user.pasetoSecret);
            await v3.Decrypt(key, token, {
                subject: user.username,
                audience: 'seanchenpiano.com',
                issuer: 'seanchenpiano.com',
            });
            res.locals.role = Role[upperCase(user.role) as keyof typeof Role];
            next();
        } else {
            throw new Error('Paseto key does not start with k3.local.');
        }
    } catch (_e) {
        console.log(_e);
        res.status(401).send('Unauthorized');
    }
};

export const checkAdmin: HandlerWithRole = async (req, res, next) => {
    if (res.locals.role === 'admin' || ignoredMethods.includes(req.method)) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

authRouter.post('/status', authAndGetRole, async (_, res) => {
    res.status(200).json({ role: res.locals.role });
});

authRouter.post('/admin-status', authAndGetRole, checkAdmin, async (_, res) => {
    res.status(200).send({ role: 'admin' });
});

authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || !validator.default.isEmail(username)) {
        return res
            .status(400)
            .send('Request missing username and/or password.');
    }

    try {
        let customer = await orm.em.findOne(User, { username });
        if (customer) {
            // Send notification email
            await mailer.duplicateEmailNotification(username);
            return res.status(200).end();
        }

        const passHash = await argon2.hash(password, { type: argon2.argon2id });

        const stripeCustomer = await stripeClient.createCustomer(username);
        customer = orm.em.create(User, {
            id: stripeCustomer.id,
            username,
            passHash,
            role: 'customer',
        });
        await orm.em.persist(customer).flush();
        await mailer.emailRegisterNotification(username);
        return res.status(200).end();
    } catch (_e) {
        return res.status(500).send('Account creation failed');
    }
});

authRouter.post('/login', async (req, res) => {
    const { username, password }: { username: string; password: string } =
        req.body;
    try {
        // We will check for email validation on front-end as well
        // But just in case someone sends a POST not from front-end
        if (!username || !password) {
            throw new Error('no user or pass');
        }

        const user = await orm.em.findOneOrFail(User, {
            $and: [{ username }, { role: ['admin', 'readonly'] }],
        });

        if (!user.passHash || !user.username) {
            throw new Error('password empty');
        }

        const match = await argon2.verify(user.passHash, password);
        if (match) {
            const { token, key } = await authorize(user.username);
            const session = crypto.randomBytes(20).toString('hex');
            user.pasetoSecret = key;
            user.session = session;
            await orm.em.flush();
            console.log(token);
            res.cookie('access_token', `Bearer ${token}`, {
                httpOnly: true,
                secure: true,
                sameSite: true,
            });
            res.cookie('id', session, {
                httpOnly: true,
                secure: true,
                sameSite: true,
            });
            return res.status(200).json();
        }
        throw new Error('password wrong');
    } catch (e) {
        console.log(e);
        return res
            .status(403)
            .send(
                'Request missing username and/or password and/or they are incorrect.',
            );
    }
});

authRouter.post('/logout', async (req, res) => {
    try {
        const pasetoCookie = req.cookies.access_token;
        const idCookie = req.cookies.id;
        const user = await orm.em.findOneOrFail(User, { session: idCookie });
        user.session = undefined;
        user.pasetoSecret = undefined;
        await orm.em.flush();

        if (idCookie) {
            res.clearCookie('id', {
                httpOnly: true,
                secure: true,
                sameSite: true,
            });
        }
        if (pasetoCookie) {
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: true,
                sameSite: true,
            });
        }
        if (!idCookie && !pasetoCookie) {
            throw new Error('neither id nor token cookies set');
        }
        return res.status(200).end();
    } catch (_e) {
        return res.status(400).end();
    }
});

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];

export const AuthRouter = authRouter;
