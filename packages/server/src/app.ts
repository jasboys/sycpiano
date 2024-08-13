import 'reflect-metadata';

import { RequestContext } from '@mikro-orm/core';
// import rootPath from 'app-root-path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded, type RequestHandler } from 'express';
import helmet from 'helmet';
import mustacheExpress from 'mustache-express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// import type { Options } from 'pino-http';
import { AdminRest } from './adminAPI/index.js';
import { AuthRouter, authAndGetRole, checkAdmin } from './authorization.js';
import { csrfMiddleware } from './csrf.js';
import orm from './database.js';
import { getMetaFromPathAndSanitize } from './meta.js';
import { precheck } from './precheck.js';
import { ApiRouter } from './publicAPI/index.js';
import { Resized } from './resized.js';

const main = async () => {
    await precheck();

    const isProduction = process.env.NODE_ENV === 'production';

    if (!process.env.PORT) {
        throw Error('No port number specified in environmental variables');
    }
    const port = Number.parseInt(process.env.PORT, 10);

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
        }
        const { default: morgan } = await import('morgan');
        return morgan('dev');
    })();

    // Stupid favicon
    await (async () => {
        if (!isProduction) {
            const { default: fav } = await import('serve-favicon');
            app.use(
                fav(
                    path.resolve(
                        process.env.IMAGE_ASSETS_DIR || './',
                        'favicon.png',
                    ),
                ),
            );
        }
    })();

    app.use(compression());

    app.use(logger);

    // helmet will add HSTS to force HTTPS connections, remove x-powered-by non-standard header,
    // sets x-frame-options header to disallow our content to be rendered in iframes.
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    'script-src-attr': null,
                    'script-src': [
                        "'self'",
                        "'unsafe-inline'",
                        "'unsafe-eval'",
                        'http://localhost:5173',
                        'http://localhost:5174',
                        'https://analytics.seanchenpiano.com',
                        'https://js.stripe.com',
                        'https://checkout.stripe.com',
                        'https://www.youtube.com/iframe_api',
                        'https://www.youtube.com/s/player/',
                    ],
                    'script-src-elem': [
                        "'self'",
                        "'unsafe-inline'",
                        "'unsafe-eval'",
                        'https://m.stripe.network',
                        'http://localhost:5173',
                        'http://localhost:5174',
                        'https://js.stripe.com',
                    ],
                    'default-src': [
                        "'self'",
                        'https://js.stripe.com/v3/',
                        'https://www.googleapis.com/youtube/v3/',
                        'https://www.youtube.com/embed/',
                    ],
                    'img-src': [
                        "'self'",
                        'https:',
                        'data:',
                        'blob:',
                        // "https://i.ytimg.com/vi/",
                        // "https://*.stripe.com",
                        // "https://*.googleapis.com",
                        // "https://*.gstatic.com",
                        // "*.google.com",
                        // "*.googleusercontent.com"
                    ],
                    'connect-src': [
                        "'self'",
                        'ws://localhost:5173/',
                        'ws://localhost:5174/',
                        'https://analytics.seanchenpiano.com',
                        'https://api.stripe.com',
                        'https://checkout.stripe.com',
                        'https://www.googleapis.com/youtube/v3/',
                        'https://*.googleapis.com',
                        '*.google.com',
                        '*.googleusercontent.com',
                        'https://*.gstatic.com',
                        'data:',
                        'blob:',
                    ],
                    'frame-src': [
                        "'self'",
                        'https://js.stripe.com',
                        'https://www.youtube.com',
                        'https://hooks.stripe.com',
                        'https://checkout.stripe.com',
                    ],
                },
            },
            crossOriginEmbedderPolicy: false,
        }),
    );

    const ormHandler: RequestHandler = (_, __, next) => {
        RequestContext.create(orm.em, next);
    };

    // Non-admin routes.
    // Don't inject bodyParser unless needed
    // and non-admin routes don't need POST
    app.use(/\/api/, ormHandler, ApiRouter);

    let allowedOrigins = [
        /localhost:\d{4}$/,
        /https:\/\/\w*.googleapis\.com.*/,
    ];

    const corsOptions = {
        origin: allowedOrigins,
        allowedHeaders: [
            'Access-Control-Allow-Headers',
            'Authorization',
            'X-Requested-With',
            'Content-Type',
            'X-Total-Count',
            'Origin',
            'Accept',
        ],
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
    };

    let viewPaths: string[];
    // only for dev
    // prod uses caddy to serve static files
    if (!isProduction) {
        const { default: rootPath } = await import('app-root-path');
        if (!process.env.MUSIC_ASSETS_DIR || !process.env.IMAGE_ASSETS_DIR) {
            throw Error('Necessary environmental variables not found');
        }
        app.use(
            '/static/music',
            cors(corsOptions),
            express.static(
                path.resolve(rootPath.toString(), process.env.MUSIC_ASSETS_DIR),
            ),
        );
        app.use(
            '/static/images',
            cors(corsOptions),
            express.static(
                path.resolve(rootPath.toString(), process.env.IMAGE_ASSETS_DIR),
            ),
        );
        app.use(
            '/static',
            cors(corsOptions),
            express.static(path.resolve(rootPath.toString(), 'assets')),
        );

        // overwrite viewPaths if in dev
        viewPaths = [
            path.resolve(rootPath.toString(), 'packages', 'web', 'src'),
            path.resolve(rootPath.toString(), 'packages', 'admin', 'src'),
        ];
    } else {
        viewPaths = [path.resolve(process.env.PARTIALS_DIR)];
    }

    app.engine('html', mustacheExpress());
    app.set('view engine', 'html');
    app.set('views', viewPaths);

    if (process.env.CORS_ORIGINS) {
        allowedOrigins = allowedOrigins.concat(
            process.env.CORS_ORIGINS.split(',').map((v) => new RegExp(v)),
        );
    }

    if (!process.env.COOKIE_SECRET) {
        throw Error('No cookie secret specified in environmental variables.');
    }
    const adminMiddlewares = [
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        urlencoded({ extended: true }),
        json(),
        ormHandler,
    ];

    app.use(/\/auth/, csrfMiddleware, adminMiddlewares, AuthRouter);

    // Custom api endpoint
    app.use(/\/rest/, adminMiddlewares, authAndGetRole, checkAdmin, AdminRest);

    // Resize images
    app.use(/\/resized/, Resized);

    // Admin
    app.use(
        /\/admin/,
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        async (_req, res) => {
            res.render('admin', {
                vite: isProduction
                    ? {}
                    : {
                          refresh: `
                        <script type="module">
                            window.global = window;
                            import RefreshRuntime from 'http://localhost:5174/@react-refresh';
                            RefreshRuntime.injectIntoGlobalHook(window);
                            window.$RefreshReg$ = () => {};
                            window.$RefreshSig$ = () => (type) => type;
                            window.__vite_plugin_react_preamble_installed__ = true;
                        </script>
                    `,
                          srcs: `
                        <!-- if development -->
                        <script type="module" src="http://localhost:5174/@vite/client"></script>
                        <script type="module" src="http://localhost:5174/main.tsx"></script>
                    `,
                      },
            });
        },
    );

    // Health-check endpoint.
    app.get('/health-check', (_req, res) => res.sendStatus(200));

    if (!isProduction) {
        app.get('/pianonotes', (_req, res) =>
            res.redirect('https://seanchenpiano.com/pianonotes'),
        );
    }

    app.get(
        /\//,
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        async (req, res) => {
            const { fbclid, ...queries } = req.query;
            req.query = queries; // NO FACEBOOK
            const { sanitize = '', ...meta } = await getMetaFromPathAndSanitize(
                req.path,
                req.query.q as string,
            );
            if (sanitize) {
                res.redirect(req.url.replace(`/${sanitize}`, ''));
                res.end();
            } else {
                meta.image =
                    meta.image ??
                    `https://${req.get(
                        'host',
                    )}/static/images/syc_chair_meta.jpg`;

                res.render('index', {
                    ...meta,
                    twitter: meta,
                    facebook: {
                        ...meta,
                        image: meta.image.replace('https', 'http'),
                        secure_image: meta.image,
                        url: `https://${req.get('host')}${req.originalUrl}`,
                    },
                    vite: isProduction
                        ? {}
                        : {
                              refresh: `
                            <script type="module">
                                window.global = window;
                                import RefreshRuntime from 'http://localhost:5173/@react-refresh';
                                RefreshRuntime.injectIntoGlobalHook(window);
                                window.$RefreshReg$ = () => {};
                                window.$RefreshSig$ = () => (type) => type;
                                window.__vite_plugin_react_preamble_installed__ = true;
                            </script>
                        `,
                              srcs: `
                            <script type="module" src="http://localhost:5173/@vite/client"></script>
                            <script type="module" src="http://localhost:5173/main.tsx"></script>
                        `,
                          },
                });
            }
        },
    );

    const host = process.env.HOST ?? '127.0.0.1';

    app.listen(port, host, () => console.log(`App listening on port ${port}.`));

    if (!isProduction) {
        if (!process.env.DEV_HTTPS_CERT_PATH || !process.env.DEV_HTTPS_PORT) {
            console.log(
                'Necessary env paths not found for HTTPS; only using HTTP.',
            );
        } else {
            const devPort = Number.parseInt(process.env.DEV_HTTPS_PORT, 10);
            const https = await import('node:https');
            const key = await readFile(
                path.resolve(process.env.DEV_HTTPS_CERT_PATH, 'cert.key'),
            );
            const cert = await readFile(
                path.resolve(process.env.DEV_HTTPS_CERT_PATH, 'cert.pem'),
            );
            const httpsOptions = {
                key,
                cert,
            };
            const server = https.createServer(httpsOptions, app);
            server.listen(devPort, host, () =>
                console.log(`App listening for https on port ${devPort}.`),
            );
        }
    }
};

main();
