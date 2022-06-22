import * as express from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as path from 'path';
import * as mustacheExpress from 'mustache-express';
import { ApiRouter } from './api-router';
import { AdminRest } from './rest';
import { Resized } from './resized';
import { getMetaFromPathAndSanitize } from './meta';
import { AuthRouter, authAndGetRole, checkAdmin } from './authorization';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as cors from 'cors';
import * as rootPath from 'app-root-path';

const main = async () => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!process.env.PORT) {
        throw new Error('No port number specified in environmental variables');
    }
    const port = parseInt(process.env.PORT, 10);

    const app = express();
    const logger = await (async () => {
        if (isProduction) {
            const { pino } = await import('pino');
            const { pinoHttp } = await import('pino-http');
            return pinoHttp({
                logger: pino(),
                serializers: {
                    req: pino.stdSerializers.req,
                    res: pino.stdSerializers.res,
                    err: pino.stdSerializers.err,
                },
            });
        } else {
            const morgan = await import('morgan');
            return morgan('dev');
        }
    })();

    // Stupid favicon
    await (async () => {
        if (!isProduction) {
            const fav = await import('serve-favicon');
            app.use(fav(path.resolve(rootPath.toString(), process.env.IMAGE_ASSETS_DIR, 'favicon.png')));
        }
    })();

    app.use(logger);

    // helmet will add HSTS to force HTTPS connections, remove x-powered-by non-standard header,
    // sets x-frame-options header to disallow our content to be rendered in iframes.
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                'script-src-attr': null,
                'script-src': [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://js.stripe.com",
                    "https://checkout.stripe.com",
                    "https://www.youtube.com/iframe_api",
                    "https://www.youtube.com/s/player/",
                ],
                'default-src': [
                    "'self'",
                    "https://js.stripe.com/v3/",
                    "https://www.googleapis.com/youtube/v3/",
                    "https://www.youtube.com/embed/",
                ],
                'img-src': [
                    "'self'",
                    "data:",
                    "https://i.ytimg.com/vi/",
                    "https://*.stripe.com"
                ],
                'connect-src': [
                    "'self'",
                    "https://api.stripe.com",
                    "https://checkout.stripe.com",
                    "https://www.googleapis.com/youtube/v3/"
                ],
                'frame-src': [
                    "'self'",
                    "https://js.stripe.com",
                    "https://www.youtube.com",
                    "https://hooks.stripe.com",
                    "https://checkout.stripe.com"
                ]
            },
        },
        // crossOriginResourcePolicy: {
        //     policy: 'cross-origin'
        // },
        crossOriginEmbedderPolicy: false
    }));

    // Non-admin routes.
    // Don't inject bodyParser unless needed
    // and non-admin routes don't need POST
    app.use(/\/api/, ApiRouter);

    // app.use(bodyParser.urlencoded({ extended: true }));
    // app.use(bodyParser.json())

    // only for dev
    // prod uses nginx to serve static files
    if (!isProduction) {
        if (!process.env.MUSIC_ASSETS_DIR || !process.env.IMAGE_ASSETS_DIR) {
            throw new Error('Necessary environmental variables not found');
        }
        app.use('/static/music', express.static(path.resolve(rootPath.toString(), process.env.MUSIC_ASSETS_DIR)));
        app.use('/static/images', express.static(path.resolve(rootPath.toString(), process.env.IMAGE_ASSETS_DIR)));
        app.use('/static', express.static(path.resolve(rootPath.toString(), 'web/assets')));
        app.use('/static', express.static(path.resolve(rootPath.toString(), 'web/build')));
    }

    app.engine('html', mustacheExpress());
    app.set('view engine', 'html');
    app.set('views', path.resolve(rootPath.toString(), 'web/build'));

    const csrfHandler = csurf({
        cookie: {
            signed: true,
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
        },
    });

    let allowedOrigins = [/localhost:\d{4}$/];
    if (process.env.CORS_ORIGINS) {
        allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(',').map(v => new RegExp(v)));
    }

    const corsOptions = {
        origin: allowedOrigins,
        allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type', 'X-Total-Count'],
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
    };

    if (!process.env.COOKIE_SECRET) {
        throw new Error('No cookie secret specified in environmental variables.');
    }
    const adminMiddlewares = [
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        csrfHandler,
        bodyParser.urlencoded({ extended: true }),
        bodyParser.json(),
    ];

    app.use(/\/auth/, adminMiddlewares, AuthRouter);

    // Custom api endpoint
    app.use(/\/rest/, adminMiddlewares, authAndGetRole, checkAdmin, AdminRest);

    // Resize images
    app.use(/\/resized/, Resized);

    if (!process.env.ADMIN_PORT) {
        throw new Error('No admin port specified in environmental variables.');
    }
    // Admin
    app.use(
        /\/admin/,
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        csrfHandler,
        createProxyMiddleware({
            target: `http://127.0.0.1:${process.env.ADMIN_PORT}`,
            ws: true,
            onProxyReq: (proxyReq, req) => {
                proxyReq.setHeader('csrf-inject', req.csrfToken());
            }
        }),
    );

    // Health-check endpoint.
    app.get('/health-check', (_req, res) => res.sendStatus(200));

    // Redirect old URLs that are indexed on google to base route.
    // const oldRoutesToRedirectsMap: Record<string, string> = {
    //     '/home': '/',
    //     '/music': '/media/music',
    //     '/about': '/about/biography',
    //     '/press': '/about/press',
    // };

    // Object.keys(oldRoutesToRedirectsMap).forEach(key => (
    //     app.get(key, (_req, res) => res.redirect(oldRoutesToRedirectsMap[key]))
    // ));

    // We catch any route first, and then let our front-end routing do the work.
    app.get(
        /\//,
        cookieParser(process.env.COOKIE_SECRET),
        csrfHandler,
        async (req, res) => {
            // if (isProduction && !req.get('host')?.match(/^www\..*/i)) {
            //     res.redirect(301, `https://www.${req.get('host')}${req.originalUrl}`);
            // }
            delete req.query.fbclid;    // NO FACEBOOK
            const { sanitize = '', notFound = false, ...meta } = await getMetaFromPathAndSanitize(req.path);
            if (notFound) {
                res.status(404);
            }
            if (sanitize) {
                res.redirect(req.url.replace(`/${sanitize}`, ''));
                res.end();
            } else {
                meta.image = meta.image ?? 'https://www.seanchenpiano.com/static/images/syc_chair_meta.jpg';
                res.render('index', {
                    csrf: req.csrfToken(),
                    twitter: meta,
                    facebook: {
                        ...meta,
                        image: meta.image.replace('https', 'http'),
                        secure_image: meta.image,
                        url: 'https://' + req.get('host') + req.originalUrl
                    },
                });
            }
        });

    app.listen(port, '127.0.0.1', () => console.log(`App listening on port ${port}.`));
}

main();
