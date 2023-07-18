// import * as dotenv from 'dotenv';
import * as argon2 from "argon2";
import * as crypto from "crypto";
import * as express from "express";
import { upperCase } from "lodash-es";
import { V3 as paseto } from "paseto";
import validator from "validator";
// dotenv.config();
import orm from "./database.js";
import { duplicateEmailNotification, emailRegisterNotification } from "./mailer.js";
import { User } from "./models/User.js";
import * as stripeClient from "./stripe.js";
const authRouter = express.Router();
authRouter.use(express.json());
authRouter.use(express.urlencoded({
    extended: true
}));
const authorize = async (user)=>{
    try {
        const key = await paseto.generateKey('local', {
            format: 'paserk'
        });
        const token = await paseto.encrypt({}, key, {
            subject: user,
            expiresIn: '2h',
            audience: 'seanchenpiano.com',
            issuer: 'seanchenpiano.com'
        });
        return {
            token,
            key
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
};
var Role;
(function(Role) {
    Role["ADMIN"] = 'admin';
    Role["CUSTOMER"] = 'customer';
})(Role || (Role = {}));
export const authAndGetRole = async (req, res, next)=>{
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
        const user = await orm.em.findOneOrFail(User, {
            session
        });
        if (user.pasetoSecret === undefined) {
            throw new Error('No paseto secret');
        }
        await paseto.decrypt(token, user.pasetoSecret, {
            subject: user.username,
            audience: 'seanchenpiano.com',
            issuer: 'seanchenpiano.com'
        });
        res.locals.role = Role[upperCase(user.role)];
        next();
    } catch (e) {
        res.status(401).send('Unauthorized');
    }
};
export const checkAdmin = async (req, res, next)=>{
    if (res.locals.role === 'admin' || ignoredMethods.includes(req.method)) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};
authRouter.post('/status', authAndGetRole, async (_, res)=>{
    res.status(200).send('Authorized');
});
authRouter.post('/admin-status', authAndGetRole, checkAdmin, async (_, res)=>{
    res.status(200).send('Authorized');
});
authRouter.post('/register', async (req, res)=>{
    const { username, password } = req.body;
    if (!username || !password || !validator.default.isEmail(username)) {
        return res.status(400).send('Request missing username and/or password.');
    }
    try {
        let customer = await orm.em.findOne(User, {
            username
        });
        if (customer) {
            // Send notification email
            await duplicateEmailNotification(username);
            return res.status(200).end();
        }
        const passHash = await argon2.hash(password, {
            type: argon2.argon2id
        });
        const stripeCustomer = await stripeClient.createCustomer(username);
        customer = orm.em.create(User, {
            id: stripeCustomer.id,
            username,
            passHash,
            role: 'customer'
        });
        await orm.em.persist(customer).flush();
        await emailRegisterNotification(username);
        return res.status(200).end();
    } catch (e) {
        return res.status(500).send('Account creation failed');
    }
});
authRouter.post('/login', async (req, res)=>{
    const { username, password } = req.body;
    try {
        // We will check for email validation on front-end as well
        // But just in case someone sends a POST not from front-end
        if (!username || !password || !validator.default.isEmail(username)) {
            throw new Error('no user or pass');
        }
        const user = await orm.em.findOneOrFail(User, {
            username
        });
        if (!user.passHash) {
            throw new Error('password empty');
        }
        const match = await argon2.verify(user.passHash, password);
        if (match) {
            const { token, key } = await authorize(user.username);
            const session = crypto.randomBytes(20).toString('hex');
            user.pasetoSecret = key;
            user.session = session;
            await orm.em.flush();
            res.cookie('access_token', 'Bearer ' + token, {
                httpOnly: true,
                secure: true,
                sameSite: true
            });
            res.cookie('id', session, {
                httpOnly: true,
                secure: true,
                sameSite: true
            });
            return res.status(200).json();
        } else {
            throw new Error('password wrong');
        }
    } catch (e) {
        return res.status(403).send('Request missing username and/or password and/or they are incorrect.');
    }
});
authRouter.post('/logout', async (req, res)=>{
    try {
        const pasetoCookie = req.cookies['access_token'];
        const idCookie = req.cookies['id'];
        const user = await orm.em.findOneOrFail(User, {
            session: idCookie
        });
        user.session = undefined;
        user.pasetoSecret = undefined;
        await orm.em.flush();
        if (idCookie) {
            res.clearCookie('id', {
                httpOnly: true,
                secure: true,
                sameSite: true
            });
        }
        if (pasetoCookie) {
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: true,
                sameSite: true
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
const ignoredMethods = [
    'GET',
    'HEAD',
    'OPTIONS'
];
export const AuthRouter = authRouter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRob3JpemF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0ICogYXMgYXJnb24yIGZyb20gJ2FyZ29uMic7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyB1cHBlckNhc2UgfSBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0IHsgVjMgYXMgcGFzZXRvIH0gZnJvbSAncGFzZXRvJztcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJztcblxuLy8gZG90ZW52LmNvbmZpZygpO1xuXG5pbXBvcnQgb3JtIGZyb20gJy4vZGF0YWJhc2UuanMnO1xuaW1wb3J0IHsgZHVwbGljYXRlRW1haWxOb3RpZmljYXRpb24sIGVtYWlsUmVnaXN0ZXJOb3RpZmljYXRpb24gfSBmcm9tICcuL21haWxlci5qcyc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9tb2RlbHMvVXNlci5qcyc7XG5pbXBvcnQgKiBhcyBzdHJpcGVDbGllbnQgZnJvbSAnLi9zdHJpcGUuanMnO1xuXG5jb25zdCBhdXRoUm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcblxuYXV0aFJvdXRlci51c2UoZXhwcmVzcy5qc29uKCkpO1xuYXV0aFJvdXRlci51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xuXG5jb25zdCBhdXRob3JpemUgPSBhc3luYyAodXNlcjogc3RyaW5nKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFzZXRvLmdlbmVyYXRlS2V5KCdsb2NhbCcsIHsgZm9ybWF0OiAncGFzZXJrJyB9KTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBwYXNldG8uZW5jcnlwdChcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1YmplY3Q6IHVzZXIsXG4gICAgICAgICAgICAgICAgZXhwaXJlc0luOiAnMmgnLFxuICAgICAgICAgICAgICAgIGF1ZGllbmNlOiAnc2VhbmNoZW5waWFuby5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlcjogJ3NlYW5jaGVucGlhbm8uY29tJ1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4geyB0b2tlbiwga2V5IH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3coZSk7XG4gICAgfVxufTtcblxuZW51bSBSb2xlIHtcbiAgICBBRE1JTiA9ICdhZG1pbicsXG4gICAgQ1VTVE9NRVIgPSAnY3VzdG9tZXInXG59XG5cbnR5cGUgSGFuZGxlcldpdGhSb2xlID0gZXhwcmVzcy5SZXF1ZXN0SGFuZGxlcjx1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB1bmtub3duLCB7IHJvbGU6IFJvbGUgfT5cblxuZXhwb3J0IGNvbnN0IGF1dGhBbmRHZXRSb2xlOiBIYW5kbGVyV2l0aFJvbGUgPSBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBpZiAoaWdub3JlZE1ldGhvZHMuaW5jbHVkZXMocmVxLm1ldGhvZCkpIHtcbiAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSByZXEuY29va2llc1snYWNjZXNzX3Rva2VuJ107XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSByZXEuY29va2llc1snaWQnXTtcbiAgICAgICAgaWYgKCFhY2Nlc3NUb2tlbiB8fCAhc2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb29raWUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzcGxpdCA9IGFjY2Vzc1Rva2VuLnNwbGl0KCcgJyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggIT09IDIgfHwgc3BsaXRbMF0gIT09ICdCZWFyZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGZvcm1hdCcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gc3BsaXRbMV07XG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChVc2VyLCB7IHNlc3Npb24gfSk7XG4gICAgICAgIGlmICh1c2VyLnBhc2V0b1NlY3JldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBhc2V0byBzZWNyZXQnKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBwYXNldG8uZGVjcnlwdChcbiAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgdXNlci5wYXNldG9TZWNyZXQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3ViamVjdDogdXNlci51c2VybmFtZSxcbiAgICAgICAgICAgICAgICBhdWRpZW5jZTogJ3NlYW5jaGVucGlhbm8uY29tJyxcbiAgICAgICAgICAgICAgICBpc3N1ZXI6ICdzZWFuY2hlbnBpYW5vLmNvbSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgcmVzLmxvY2Fscy5yb2xlID0gUm9sZVt1cHBlckNhc2UodXNlci5yb2xlKSBhcyBrZXlvZiB0eXBlb2YgUm9sZV07XG4gICAgICAgIG5leHQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKCdVbmF1dGhvcml6ZWQnKTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tBZG1pbjogSGFuZGxlcldpdGhSb2xlID0gYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgaWYgKHJlcy5sb2NhbHMucm9sZSA9PT0gJ2FkbWluJyB8fCBpZ25vcmVkTWV0aG9kcy5pbmNsdWRlcyhyZXEubWV0aG9kKSkge1xuICAgICAgICBuZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoJ1VuYXV0aG9yaXplZCcpO1xuICAgIH1cbn1cblxuYXV0aFJvdXRlci5wb3N0KCcvc3RhdHVzJywgYXV0aEFuZEdldFJvbGUsIGFzeW5jIChfLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCgnQXV0aG9yaXplZCcpO1xufSlcblxuYXV0aFJvdXRlci5wb3N0KCcvYWRtaW4tc3RhdHVzJywgYXV0aEFuZEdldFJvbGUsIGNoZWNrQWRtaW4sIGFzeW5jIChfLCByZXMpID0+IHtcbiAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCgnQXV0aG9yaXplZCcpO1xufSk7XG5cbmF1dGhSb3V0ZXIucG9zdCgnL3JlZ2lzdGVyJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkIHx8ICF2YWxpZGF0b3IuZGVmYXVsdC5pc0VtYWlsKHVzZXJuYW1lKSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLnNlbmQoJ1JlcXVlc3QgbWlzc2luZyB1c2VybmFtZSBhbmQvb3IgcGFzc3dvcmQuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IGN1c3RvbWVyID0gYXdhaXQgb3JtLmVtLmZpbmRPbmUoVXNlciwgeyB1c2VybmFtZSB9KTtcbiAgICAgICAgaWYgKGN1c3RvbWVyKSB7XG4gICAgICAgICAgICAvLyBTZW5kIG5vdGlmaWNhdGlvbiBlbWFpbFxuICAgICAgICAgICAgYXdhaXQgZHVwbGljYXRlRW1haWxOb3RpZmljYXRpb24odXNlcm5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5lbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhc3NIYXNoID0gYXdhaXQgYXJnb24yLmhhc2gocGFzc3dvcmQsIHsgdHlwZTogYXJnb24yLmFyZ29uMmlkIH0pO1xuXG4gICAgICAgIGNvbnN0IHN0cmlwZUN1c3RvbWVyID0gYXdhaXQgc3RyaXBlQ2xpZW50LmNyZWF0ZUN1c3RvbWVyKHVzZXJuYW1lKTtcbiAgICAgICAgY3VzdG9tZXIgPSBvcm0uZW0uY3JlYXRlKFxuICAgICAgICAgICAgVXNlcixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogc3RyaXBlQ3VzdG9tZXIuaWQsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc0hhc2gsXG4gICAgICAgICAgICAgICAgcm9sZTogJ2N1c3RvbWVyJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBvcm0uZW0ucGVyc2lzdChjdXN0b21lcikuZmx1c2goKTtcbiAgICAgICAgYXdhaXQgZW1haWxSZWdpc3Rlck5vdGlmaWNhdGlvbih1c2VybmFtZSk7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuZW5kKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoJ0FjY291bnQgY3JlYXRpb24gZmFpbGVkJyk7XG4gICAgfVxufSk7XG5cbmF1dGhSb3V0ZXIucG9zdCgnL2xvZ2luJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA6IHsgdXNlcm5hbWU6IHN0cmluZzsgcGFzc3dvcmQ6IHN0cmluZ30gPSByZXEuYm9keTtcbiAgICB0cnkge1xuICAgICAgICAvLyBXZSB3aWxsIGNoZWNrIGZvciBlbWFpbCB2YWxpZGF0aW9uIG9uIGZyb250LWVuZCBhcyB3ZWxsXG4gICAgICAgIC8vIEJ1dCBqdXN0IGluIGNhc2Ugc29tZW9uZSBzZW5kcyBhIFBPU1Qgbm90IGZyb20gZnJvbnQtZW5kXG4gICAgICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkIHx8ICF2YWxpZGF0b3IuZGVmYXVsdC5pc0VtYWlsKHVzZXJuYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyB1c2VyIG9yIHBhc3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChVc2VyLCB7IHVzZXJuYW1lIH0pO1xuXG4gICAgICAgIGlmICghdXNlci5wYXNzSGFzaCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXNzd29yZCBlbXB0eScpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBhd2FpdCBhcmdvbjIudmVyaWZ5KHVzZXIucGFzc0hhc2gsIHBhc3N3b3JkKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCB7IHRva2VuLCBrZXkgfSA9IGF3YWl0IGF1dGhvcml6ZSh1c2VyLnVzZXJuYW1lISk7XG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDIwKS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgICAgICB1c2VyLnBhc2V0b1NlY3JldCA9IGtleTtcbiAgICAgICAgICAgIHVzZXIuc2Vzc2lvbiA9IHNlc3Npb247XG4gICAgICAgICAgICBhd2FpdCBvcm0uZW0uZmx1c2goKTtcbiAgICAgICAgICAgIHJlcy5jb29raWUoJ2FjY2Vzc190b2tlbicsICdCZWFyZXIgJyArIHRva2VuLCB7XG4gICAgICAgICAgICAgICAgaHR0cE9ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNhbWVTaXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXMuY29va2llKCdpZCcsIHNlc3Npb24sIHtcbiAgICAgICAgICAgICAgICBodHRwT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2FtZVNpdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXNzd29yZCB3cm9uZycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLnNlbmQoJ1JlcXVlc3QgbWlzc2luZyB1c2VybmFtZSBhbmQvb3IgcGFzc3dvcmQgYW5kL29yIHRoZXkgYXJlIGluY29ycmVjdC4nKTtcblxuICAgIH1cbn0pO1xuXG5hdXRoUm91dGVyLnBvc3QoJy9sb2dvdXQnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXNldG9Db29raWUgPSByZXEuY29va2llc1snYWNjZXNzX3Rva2VuJ107XG4gICAgICAgIGNvbnN0IGlkQ29va2llID0gcmVxLmNvb2tpZXNbJ2lkJ107XG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChVc2VyLCB7IHNlc3Npb246IGlkQ29va2llIH0pO1xuICAgICAgICB1c2VyLnNlc3Npb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIHVzZXIucGFzZXRvU2VjcmV0ID0gdW5kZWZpbmVkO1xuICAgICAgICBhd2FpdCBvcm0uZW0uZmx1c2goKTtcblxuICAgICAgICBpZiAoaWRDb29raWUpIHtcbiAgICAgICAgICAgIHJlcy5jbGVhckNvb2tpZSgnaWQnLCB7XG4gICAgICAgICAgICAgICAgaHR0cE9ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNhbWVTaXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhc2V0b0Nvb2tpZSkge1xuICAgICAgICAgICAgcmVzLmNsZWFyQ29va2llKCdhY2Nlc3NfdG9rZW4nLCB7XG4gICAgICAgICAgICAgICAgaHR0cE9ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNhbWVTaXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpZENvb2tpZSAmJiAhcGFzZXRvQ29va2llKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25laXRoZXIgaWQgbm9yIHRva2VuIGNvb2tpZXMgc2V0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5lbmQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuZW5kKCk7XG4gICAgfVxufSk7XG5cbmNvbnN0IGlnbm9yZWRNZXRob2RzID0gWydHRVQnLCAnSEVBRCcsICdPUFRJT05TJ107XG5cbmV4cG9ydCBjb25zdCBBdXRoUm91dGVyID0gYXV0aFJvdXRlcjtcbiJdLCJuYW1lcyI6WyJhcmdvbjIiLCJjcnlwdG8iLCJleHByZXNzIiwidXBwZXJDYXNlIiwiVjMiLCJwYXNldG8iLCJ2YWxpZGF0b3IiLCJvcm0iLCJkdXBsaWNhdGVFbWFpbE5vdGlmaWNhdGlvbiIsImVtYWlsUmVnaXN0ZXJOb3RpZmljYXRpb24iLCJVc2VyIiwic3RyaXBlQ2xpZW50IiwiYXV0aFJvdXRlciIsIlJvdXRlciIsInVzZSIsImpzb24iLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJhdXRob3JpemUiLCJ1c2VyIiwia2V5IiwiZ2VuZXJhdGVLZXkiLCJmb3JtYXQiLCJ0b2tlbiIsImVuY3J5cHQiLCJzdWJqZWN0IiwiZXhwaXJlc0luIiwiYXVkaWVuY2UiLCJpc3N1ZXIiLCJlIiwiY29uc29sZSIsImxvZyIsIlJvbGUiLCJBRE1JTiIsIkNVU1RPTUVSIiwiYXV0aEFuZEdldFJvbGUiLCJyZXEiLCJyZXMiLCJuZXh0IiwiaWdub3JlZE1ldGhvZHMiLCJpbmNsdWRlcyIsIm1ldGhvZCIsImFjY2Vzc1Rva2VuIiwiY29va2llcyIsInNlc3Npb24iLCJFcnJvciIsInNwbGl0IiwibGVuZ3RoIiwiZW0iLCJmaW5kT25lT3JGYWlsIiwicGFzZXRvU2VjcmV0IiwidW5kZWZpbmVkIiwiZGVjcnlwdCIsInVzZXJuYW1lIiwibG9jYWxzIiwicm9sZSIsInN0YXR1cyIsInNlbmQiLCJjaGVja0FkbWluIiwicG9zdCIsIl8iLCJwYXNzd29yZCIsImJvZHkiLCJkZWZhdWx0IiwiaXNFbWFpbCIsImN1c3RvbWVyIiwiZmluZE9uZSIsImVuZCIsInBhc3NIYXNoIiwiaGFzaCIsInR5cGUiLCJhcmdvbjJpZCIsInN0cmlwZUN1c3RvbWVyIiwiY3JlYXRlQ3VzdG9tZXIiLCJjcmVhdGUiLCJpZCIsInBlcnNpc3QiLCJmbHVzaCIsIm1hdGNoIiwidmVyaWZ5IiwicmFuZG9tQnl0ZXMiLCJ0b1N0cmluZyIsImNvb2tpZSIsImh0dHBPbmx5Iiwic2VjdXJlIiwic2FtZVNpdGUiLCJwYXNldG9Db29raWUiLCJpZENvb2tpZSIsImNsZWFyQ29va2llIiwiQXV0aFJvdXRlciJdLCJtYXBwaW5ncyI6IkFBQUEsb0NBQW9DO0FBQ3BDLFlBQVlBLFlBQVksU0FBUztBQUNqQyxZQUFZQyxZQUFZLFNBQVM7QUFDakMsWUFBWUMsYUFBYSxVQUFVO0FBQ25DLFNBQVNDLFNBQVMsUUFBUSxZQUFZO0FBQ3RDLFNBQVNDLE1BQU1DLE1BQU0sUUFBUSxTQUFTO0FBQ3RDLE9BQU9DLGVBQWUsWUFBWTtBQUVsQyxtQkFBbUI7QUFFbkIsT0FBT0MsU0FBUyxnQkFBZ0I7QUFDaEMsU0FBU0MsMEJBQTBCLEVBQUVDLHlCQUF5QixRQUFRLGNBQWM7QUFDcEYsU0FBU0MsSUFBSSxRQUFRLG1CQUFtQjtBQUN4QyxZQUFZQyxrQkFBa0IsY0FBYztBQUU1QyxNQUFNQyxhQUFhVixRQUFRVyxNQUFNO0FBRWpDRCxXQUFXRSxHQUFHLENBQUNaLFFBQVFhLElBQUk7QUFDM0JILFdBQVdFLEdBQUcsQ0FBQ1osUUFBUWMsVUFBVSxDQUFDO0lBQUVDLFVBQVU7QUFBSztBQUVuRCxNQUFNQyxZQUFZLE9BQU9DO0lBQ3JCLElBQUk7UUFDQSxNQUFNQyxNQUFNLE1BQU1mLE9BQU9nQixXQUFXLENBQUMsU0FBUztZQUFFQyxRQUFRO1FBQVM7UUFDakUsTUFBTUMsUUFBUSxNQUFNbEIsT0FBT21CLE9BQU8sQ0FDOUIsQ0FBQyxHQUNESixLQUNBO1lBQ0lLLFNBQVNOO1lBQ1RPLFdBQVc7WUFDWEMsVUFBVTtZQUNWQyxRQUFRO1FBQ1o7UUFFSixPQUFPO1lBQUVMO1lBQU9IO1FBQUk7SUFDeEIsRUFBRSxPQUFPUyxHQUFHO1FBQ1JDLFFBQVFDLEdBQUcsQ0FBQ0Y7UUFDWixNQUFNQTtJQUNWO0FBQ0o7SUFFQTtVQUFLRyxJQUFJO0lBQUpBLEtBQ0RDLFdBQVE7SUFEUEQsS0FFREUsY0FBVztHQUZWRixTQUFBQTtBQU9MLE9BQU8sTUFBTUcsaUJBQWtDLE9BQU9DLEtBQUtDLEtBQUtDO0lBQzVELElBQUlDLGVBQWVDLFFBQVEsQ0FBQ0osSUFBSUssTUFBTSxHQUFHO1FBQ3JDLE9BQU9IO0lBQ1g7SUFDQSxJQUFJO1FBQ0EsTUFBTUksY0FBY04sSUFBSU8sT0FBTyxDQUFDLGVBQWU7UUFDL0MsTUFBTUMsVUFBVVIsSUFBSU8sT0FBTyxDQUFDLEtBQUs7UUFDakMsSUFBSSxDQUFDRCxlQUFlLENBQUNFLFNBQVM7WUFDMUIsTUFBTSxJQUFJQyxNQUFNO1FBQ3BCO1FBQ0EsTUFBTUMsUUFBUUosWUFBWUksS0FBSyxDQUFDO1FBQ2hDLElBQUlBLE1BQU1DLE1BQU0sS0FBSyxLQUFLRCxLQUFLLENBQUMsRUFBRSxLQUFLLFVBQVU7WUFDN0MsTUFBTSxJQUFJRCxNQUFNO1FBQ3BCO1FBQ0EsTUFBTXRCLFFBQVF1QixLQUFLLENBQUMsRUFBRTtRQUN0QixNQUFNM0IsT0FBTyxNQUFNWixJQUFJeUMsRUFBRSxDQUFDQyxhQUFhLENBQUN2QyxNQUFNO1lBQUVrQztRQUFRO1FBQ3hELElBQUl6QixLQUFLK0IsWUFBWSxLQUFLQyxXQUFXO1lBQ2pDLE1BQU0sSUFBSU4sTUFBTTtRQUNwQjtRQUNBLE1BQU14QyxPQUFPK0MsT0FBTyxDQUNoQjdCLE9BQ0FKLEtBQUsrQixZQUFZLEVBQ2pCO1lBQ0l6QixTQUFTTixLQUFLa0MsUUFBUTtZQUN0QjFCLFVBQVU7WUFDVkMsUUFBUTtRQUNaO1FBRUpTLElBQUlpQixNQUFNLENBQUNDLElBQUksR0FBR3ZCLElBQUksQ0FBQzdCLFVBQVVnQixLQUFLb0MsSUFBSSxFQUF1QjtRQUNqRWpCO0lBQ0osRUFBRSxPQUFPVCxHQUFHO1FBQ1JRLElBQUltQixNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO0lBQ3pCO0FBQ0osRUFBRTtBQUVGLE9BQU8sTUFBTUMsYUFBOEIsT0FBT3RCLEtBQUtDLEtBQUtDO0lBQ3hELElBQUlELElBQUlpQixNQUFNLENBQUNDLElBQUksS0FBSyxXQUFXaEIsZUFBZUMsUUFBUSxDQUFDSixJQUFJSyxNQUFNLEdBQUc7UUFDcEVIO0lBQ0osT0FBTztRQUNIRCxJQUFJbUIsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztJQUN6QjtBQUNKLEVBQUM7QUFFRDdDLFdBQVcrQyxJQUFJLENBQUMsV0FBV3hCLGdCQUFnQixPQUFPeUIsR0FBR3ZCO0lBQ2pEQSxJQUFJbUIsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztBQUN6QjtBQUVBN0MsV0FBVytDLElBQUksQ0FBQyxpQkFBaUJ4QixnQkFBZ0J1QixZQUFZLE9BQU9FLEdBQUd2QjtJQUNuRUEsSUFBSW1CLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7QUFDekI7QUFFQTdDLFdBQVcrQyxJQUFJLENBQUMsYUFBYSxPQUFPdkIsS0FBS0M7SUFDckMsTUFBTSxFQUFFZ0IsUUFBUSxFQUFFUSxRQUFRLEVBQUUsR0FBR3pCLElBQUkwQixJQUFJO0lBQ3ZDLElBQUksQ0FBQ1QsWUFBWSxDQUFDUSxZQUFZLENBQUN2RCxVQUFVeUQsT0FBTyxDQUFDQyxPQUFPLENBQUNYLFdBQVc7UUFDaEUsT0FBT2hCLElBQUltQixNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO0lBQ2hDO0lBRUEsSUFBSTtRQUNBLElBQUlRLFdBQVcsTUFBTTFELElBQUl5QyxFQUFFLENBQUNrQixPQUFPLENBQUN4RCxNQUFNO1lBQUUyQztRQUFTO1FBQ3JELElBQUlZLFVBQVU7WUFDViwwQkFBMEI7WUFDMUIsTUFBTXpELDJCQUEyQjZDO1lBQ2pDLE9BQU9oQixJQUFJbUIsTUFBTSxDQUFDLEtBQUtXLEdBQUc7UUFDOUI7UUFFQSxNQUFNQyxXQUFXLE1BQU1wRSxPQUFPcUUsSUFBSSxDQUFDUixVQUFVO1lBQUVTLE1BQU10RSxPQUFPdUUsUUFBUTtRQUFDO1FBRXJFLE1BQU1DLGlCQUFpQixNQUFNN0QsYUFBYThELGNBQWMsQ0FBQ3BCO1FBQ3pEWSxXQUFXMUQsSUFBSXlDLEVBQUUsQ0FBQzBCLE1BQU0sQ0FDcEJoRSxNQUNBO1lBQ0lpRSxJQUFJSCxlQUFlRyxFQUFFO1lBQ3JCdEI7WUFDQWU7WUFDQWIsTUFBTTtRQUNWO1FBQ0osTUFBTWhELElBQUl5QyxFQUFFLENBQUM0QixPQUFPLENBQUNYLFVBQVVZLEtBQUs7UUFDcEMsTUFBTXBFLDBCQUEwQjRDO1FBQ2hDLE9BQU9oQixJQUFJbUIsTUFBTSxDQUFDLEtBQUtXLEdBQUc7SUFDOUIsRUFBRSxPQUFPdEMsR0FBRztRQUNSLE9BQU9RLElBQUltQixNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO0lBQ2hDO0FBQ0o7QUFFQTdDLFdBQVcrQyxJQUFJLENBQUMsVUFBVSxPQUFPdkIsS0FBS0M7SUFDbEMsTUFBTSxFQUFFZ0IsUUFBUSxFQUFFUSxRQUFRLEVBQUUsR0FBMkN6QixJQUFJMEIsSUFBSTtJQUMvRSxJQUFJO1FBQ0EsMERBQTBEO1FBQzFELDJEQUEyRDtRQUMzRCxJQUFJLENBQUNULFlBQVksQ0FBQ1EsWUFBWSxDQUFDdkQsVUFBVXlELE9BQU8sQ0FBQ0MsT0FBTyxDQUFDWCxXQUFXO1lBQ2hFLE1BQU0sSUFBSVIsTUFBTTtRQUNwQjtRQUVBLE1BQU0xQixPQUFPLE1BQU1aLElBQUl5QyxFQUFFLENBQUNDLGFBQWEsQ0FBQ3ZDLE1BQU07WUFBRTJDO1FBQVM7UUFFekQsSUFBSSxDQUFDbEMsS0FBS2lELFFBQVEsRUFBRTtZQUNoQixNQUFNLElBQUl2QixNQUFNO1FBQ3BCO1FBRUEsTUFBTWlDLFFBQVEsTUFBTTlFLE9BQU8rRSxNQUFNLENBQUM1RCxLQUFLaUQsUUFBUSxFQUFFUDtRQUNqRCxJQUFJaUIsT0FBTztZQUNQLE1BQU0sRUFBRXZELEtBQUssRUFBRUgsR0FBRyxFQUFFLEdBQUcsTUFBTUYsVUFBVUMsS0FBS2tDLFFBQVE7WUFDcEQsTUFBTVQsVUFBVTNDLE9BQU8rRSxXQUFXLENBQUMsSUFBSUMsUUFBUSxDQUFDO1lBQ2hEOUQsS0FBSytCLFlBQVksR0FBRzlCO1lBQ3BCRCxLQUFLeUIsT0FBTyxHQUFHQTtZQUNmLE1BQU1yQyxJQUFJeUMsRUFBRSxDQUFDNkIsS0FBSztZQUNsQnhDLElBQUk2QyxNQUFNLENBQUMsZ0JBQWdCLFlBQVkzRCxPQUFPO2dCQUMxQzRELFVBQVU7Z0JBQ1ZDLFFBQVE7Z0JBQ1JDLFVBQVU7WUFDZDtZQUNBaEQsSUFBSTZDLE1BQU0sQ0FBQyxNQUFNdEMsU0FBUztnQkFDdEJ1QyxVQUFVO2dCQUNWQyxRQUFRO2dCQUNSQyxVQUFVO1lBQ2Q7WUFDQSxPQUFPaEQsSUFBSW1CLE1BQU0sQ0FBQyxLQUFLekMsSUFBSTtRQUMvQixPQUFPO1lBQ0gsTUFBTSxJQUFJOEIsTUFBTTtRQUNwQjtJQUNKLEVBQUUsT0FBT2hCLEdBQUc7UUFDUixPQUFPUSxJQUFJbUIsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztJQUVoQztBQUNKO0FBRUE3QyxXQUFXK0MsSUFBSSxDQUFDLFdBQVcsT0FBT3ZCLEtBQUtDO0lBQ25DLElBQUk7UUFDQSxNQUFNaUQsZUFBZWxELElBQUlPLE9BQU8sQ0FBQyxlQUFlO1FBQ2hELE1BQU00QyxXQUFXbkQsSUFBSU8sT0FBTyxDQUFDLEtBQUs7UUFDbEMsTUFBTXhCLE9BQU8sTUFBTVosSUFBSXlDLEVBQUUsQ0FBQ0MsYUFBYSxDQUFDdkMsTUFBTTtZQUFFa0MsU0FBUzJDO1FBQVM7UUFDbEVwRSxLQUFLeUIsT0FBTyxHQUFHTztRQUNmaEMsS0FBSytCLFlBQVksR0FBR0M7UUFDcEIsTUFBTTVDLElBQUl5QyxFQUFFLENBQUM2QixLQUFLO1FBRWxCLElBQUlVLFVBQVU7WUFDVmxELElBQUltRCxXQUFXLENBQUMsTUFBTTtnQkFDbEJMLFVBQVU7Z0JBQ1ZDLFFBQVE7Z0JBQ1JDLFVBQVU7WUFDZDtRQUNKO1FBQ0EsSUFBSUMsY0FBYztZQUNkakQsSUFBSW1ELFdBQVcsQ0FBQyxnQkFBZ0I7Z0JBQzVCTCxVQUFVO2dCQUNWQyxRQUFRO2dCQUNSQyxVQUFVO1lBQ2Q7UUFDSjtRQUNBLElBQUksQ0FBQ0UsWUFBWSxDQUFDRCxjQUFjO1lBQzVCLE1BQU0sSUFBSXpDLE1BQU07UUFDcEI7UUFDQSxPQUFPUixJQUFJbUIsTUFBTSxDQUFDLEtBQUtXLEdBQUc7SUFDOUIsRUFBRSxPQUFPdEMsR0FBRztRQUNSLE9BQU9RLElBQUltQixNQUFNLENBQUMsS0FBS1csR0FBRztJQUM5QjtBQUNKO0FBRUEsTUFBTTVCLGlCQUFpQjtJQUFDO0lBQU87SUFBUTtDQUFVO0FBRWpELE9BQU8sTUFBTWtELGFBQWE3RSxXQUFXIn0=