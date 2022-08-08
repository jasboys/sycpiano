// import * as dotenv from 'dotenv';
import * as express from 'express';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import validator from 'validator';
import { V3 as paseto } from 'paseto';
import * as stripeClient from './stripe';
import db from './models';

// dotenv.config();

import { duplicateEmailNotification, emailRegisterNotification } from './mailer';

const models = db.models;

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

const authorize = async (user: string) => {
    try {
        const key = await paseto.generateKey('local', { format: 'paserk' });
        const token = await paseto.encrypt(
            {},
            key,
            {
                subject: user,
                expiresIn: '2h',
                audience: 'seanchenpiano.com',
                issuer: 'seanchenpiano.com'
            }
        );
        return { token, key };
    } catch (e) {
        console.log(e);
        throw(e);
    }
};

export const authAndGetRole: express.RequestHandler = async (req, res, next) => {
    if (ignoredMethods.includes(req.method)) {
        return next();
    }
    try {
        const accessToken = req.cookies['access_token'];
        const session = req.cookies['id'];
        if (!accessToken || !session) {
            throw new Error('No cookie');
        }
        const split = accessToken.split(' ');
        if (split.length !== 2 || split[0] !== 'Bearer') {
            throw new Error('Wrong format');
        }
        const token = split[1];
        const user = await models.user.findOne({ where: { session } });
        if (!user?.pasetoSecret) {
            throw new Error('No paseto secret');
        }
        await paseto.decrypt(
            token,
            user.pasetoSecret,
            {
                subject: user.username,
                audience: 'seanchenpiano.com',
                issuer: 'seanchenpiano.com'
            }
        );
        req.role = user.role;
        next();
    } catch (e) {
        res.status(401).send('Unauthorized');
    }
};

export const checkAdmin: express.RequestHandler = async (req, res, next) => {
    if (req.role === 'admin' || ignoredMethods.includes(req.method)) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

authRouter.post('/status', authAndGetRole, async (_, res) => {
    res.status(200).send('Authorized');
})

authRouter.post('/admin-status', authAndGetRole, checkAdmin, async (_, res) => {
    res.status(200).send('Authorized');
});

authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || !validator.isEmail(username)) {
        return res.status(400).send('Request missing username and/or password.');
    }

    let customer = await models.user.findOne({ where: { username } });
    if (customer) {
        // Send notification email
        await duplicateEmailNotification(username);
        return res.status(200).end();
    }

    const passHash = await argon2.hash(password, { type: argon2.argon2id });

    try {
        const stripeCustomer = await stripeClient.createCustomer(username);
        customer = await models.user.create({
            id: stripeCustomer.id,
            username,
            passHash,
            role: 'customer',
        });
        await emailRegisterNotification(username);
        return res.status(200).end();
    } catch (e) {
        return res.status(500).send('Account creation failed');
    }
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // We will check for email validation on front-end as well
        // But just in case someone sends a POST not from front-end
        if (!username || !password || !validator.isEmail(username)) {
            throw new Error('no user or pass');
        }

        const user = await models.user.findOne({ where: { username } });
        if (!user) {
            throw new Error('user not found');
        }

        const match = await argon2.verify(user.passHash, password);
        if (match) {
            const { token, key } = await authorize(user.username);
            const session = crypto.randomBytes(20).toString('hex');
            user.set('pasetoSecret', key);
            user.set('session', session);
            await user.save();
            res.cookie('access_token', 'Bearer ' + token, {
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
        } else {
            throw new Error('password wrong');
        }
    } catch (e) {
        return res.status(403).send('Request missing username and/or password and/or they are incorrect.');

    }
});

authRouter.post('/logout', async (req, res) => {
    try {
        const pasetoCookie = req.cookies['access_token'];
        const idCookie = req.cookies['id'];
        const user = await models.user.findOne({ where: { session: idCookie } });
        if (!user) {
            throw new Error('no user found');
        }
        user.set({ session: undefined });
        user.set({ pasetoSecret: undefined });
        await user.save();

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
    } catch (e) {
        return res.status(400).end();
    }
});

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];

export const AuthRouter = authRouter;
