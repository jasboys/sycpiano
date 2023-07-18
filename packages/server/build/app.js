import "reflect-metadata";
import { RequestContext } from "@mikro-orm/core";
import rootPath from "app-root-path";
import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express, { json, urlencoded } from "express";
import { readFileSync } from "fs";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import mustacheExpress from "mustache-express";
import path from "path";
import { ApiRouter } from "./api-router.js";
import { AuthRouter, authAndGetRole, checkAdmin } from "./authorization.js";
import orm from "./database.js";
import { getMetaFromPathAndSanitize } from "./meta.js";
import { precheck } from "./precheck.js";
import { Resized } from "./resized.js";
import { AdminRest } from "./rest.js";
const main = async ()=>{
    await precheck();
    const isProduction = process.env.NODE_ENV === 'production';
    if (!process.env.PORT) {
        throw Error('No port number specified in environmental variables');
    }
    const port = parseInt(process.env.PORT, 10);
    const app = express();
    const logger = await (async ()=>{
        if (isProduction) {
            const { pino } = await import("pino");
            const { pinoHttp } = await import("pino-http");
            return pinoHttp({
                logger: pino(),
                serializers: {
                    req: pino.stdSerializers.req,
                    res: pino.stdSerializers.res,
                    err: pino.stdSerializers.err
                }
            });
        } else {
            const { default: morgan } = await import("morgan");
            return morgan('dev');
        }
    })();
    // Stupid favicon
    await (async ()=>{
        if (!isProduction) {
            const { default: fav } = await import("serve-favicon");
            app.use(fav(path.resolve(process.env.IMAGE_ASSETS_DIR || './', 'favicon.png')));
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
                    "http://localhost:5173",
                    "https://js.stripe.com",
                    "https://checkout.stripe.com",
                    "https://www.youtube.com/iframe_api",
                    "https://www.youtube.com/s/player/"
                ],
                'default-src': [
                    "'self'",
                    "https://js.stripe.com/v3/",
                    "https://www.googleapis.com/youtube/v3/",
                    "https://www.youtube.com/embed/"
                ],
                'img-src': [
                    // "'self'",
                    "https:",
                    "data:"
                ],
                'connect-src': [
                    "'self'",
                    "ws://localhost:5173/",
                    "https://api.stripe.com",
                    "https://checkout.stripe.com",
                    "https://www.googleapis.com/youtube/v3/",
                    "https://*.googleapis.com",
                    "*.google.com",
                    "*.googleusercontent.com",
                    "https://*.gstatic.com",
                    "data:",
                    "blob:"
                ],
                'frame-src': [
                    "'self'",
                    "https://js.stripe.com",
                    "https://www.youtube.com",
                    "https://hooks.stripe.com",
                    "https://checkout.stripe.com"
                ]
            }
        },
        crossOriginEmbedderPolicy: false
    }));
    const ormHandler = (_, __, next)=>{
        RequestContext.create(orm.em, next);
    };
    // Non-admin routes.
    // Don't inject bodyParser unless needed
    // and non-admin routes don't need POST
    app.use(/\/api/, ormHandler, ApiRouter);
    // only for dev
    // prod uses nginx to serve static files
    if (!isProduction) {
        if (!process.env.MUSIC_ASSETS_DIR || !process.env.IMAGE_ASSETS_DIR) {
            throw Error('Necessary environmental variables not found');
        }
        app.use('/static/music', express.static(path.resolve(rootPath.toString(), process.env.MUSIC_ASSETS_DIR)));
        app.use('/static/images', express.static(path.resolve(rootPath.toString(), process.env.IMAGE_ASSETS_DIR)));
        app.use('/static', express.static(path.resolve(rootPath.toString(), 'assets')));
        // app.use('/static', express.static(path.resolve(rootPath.toString(), 'web/build')));
        app.use('/static', createProxyMiddleware({
            target: 'http://localhost:5173',
            ws: true
        }));
    }
    app.engine('html', mustacheExpress());
    app.set('view engine', 'html');
    app.set('views', path.resolve(rootPath.toString(), 'partials'));
    const csrfHandler = csurf({
        cookie: {
            signed: true,
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
        }
    });
    let allowedOrigins = [
        /localhost:\d{4}$/,
        /https:\/\/\w*.googleapis\.com.*/
    ];
    if (process.env.CORS_ORIGINS) {
        allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(',').map((v)=>new RegExp(v)));
    }
    const corsOptions = {
        origin: allowedOrigins,
        allowedHeaders: [
            'Access-Control-Allow-Headers',
            'Authorization',
            'X-Requested-With',
            'Content-Type',
            'X-Total-Count',
            'Origin',
            'Accept'
        ],
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true
    };
    if (!process.env.COOKIE_SECRET) {
        throw Error('No cookie secret specified in environmental variables.');
    }
    const adminMiddlewares = [
        cors(corsOptions),
        cookieParser(process.env.COOKIE_SECRET),
        csrfHandler,
        urlencoded({
            extended: true
        }),
        json()
    ];
    app.use(/\/auth/, adminMiddlewares, AuthRouter);
    // Custom api endpoint
    app.use(/\/rest/, adminMiddlewares, ormHandler, authAndGetRole, checkAdmin, AdminRest);
    // Resize images
    app.use(/\/resized/, Resized);
    if (!process.env.ADMIN_PORT) {
        throw Error('No admin port specified in environmental variables.');
    }
    // Admin
    app.use(/\/admin/, cors(corsOptions), cookieParser(process.env.COOKIE_SECRET), csrfHandler, createProxyMiddleware({
        target: `http://127.0.0.1:${process.env.ADMIN_PORT}`,
        ws: true,
        onProxyReq: (proxyReq, req)=>{
            proxyReq.setHeader('csrf-inject', req.csrfToken());
        }
    }));
    // Health-check endpoint.
    app.get('/health-check', (_req, res)=>res.sendStatus(200));
    if (!isProduction) {
        app.get('/pianonotes', (_req, res)=>res.redirect('https://seanchenpiano.com/pianonotes'));
    }
    app.get(/\//, cors(corsOptions), cookieParser(process.env.COOKIE_SECRET), csrfHandler, async (req, res)=>{
        delete req.query.fbclid; // NO FACEBOOK
        const { sanitize = '', ...meta } = await getMetaFromPathAndSanitize(req.path, req.query.q);
        if (sanitize) {
            res.redirect(req.url.replace(`/${sanitize}`, ''));
            res.end();
        } else {
            meta.image = meta.image ?? `https://${req.get('host')}/static/images/syc_chair_meta.jpg`;
            res.render('index', {
                csrf: req.csrfToken(),
                ...meta,
                twitter: meta,
                facebook: {
                    ...meta,
                    image: meta.image.replace('https', 'http'),
                    secure_image: meta.image,
                    url: 'https://' + req.get('host') + req.originalUrl
                },
                vite: {
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
                            <!-- if development -->
                            <script type="module" src="http://localhost:5173/@vite/client"></script>
                            <script type="module" src="http://localhost:5173/main.tsx"></script>
                        `
                }
            });
        }
    });
    const host = process.env.HOST ?? '127.0.0.1';
    app.listen(port, host, ()=>console.log(`App listening on port ${port}.`));
    if (!isProduction) {
        if (!process.env.DEV_HTTPS_CERT_PATH || !process.env.DEV_HTTPS_PORT) {
            console.log('Necessary env paths not found for HTTPS; only using HTTP.');
        } else {
            const devPort = parseInt(process.env.DEV_HTTPS_PORT, 10);
            const https = await import("https");
            const httpsOptions = {
                key: readFileSync(path.resolve(process.env.DEV_HTTPS_CERT_PATH, 'cert.key')),
                cert: readFileSync(path.resolve(process.env.DEV_HTTPS_CERT_PATH, 'cert.pem'))
            };
            const server = https.createServer(httpsOptions, app);
            server.listen(devPort, host, ()=>console.log(`App listening for https on port ${devPort}.`));
        }
    }
};
main();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcclxuXHJcbmltcG9ydCB7IFJlcXVlc3RDb250ZXh0IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcclxuaW1wb3J0IHJvb3RQYXRoIGZyb20gJ2FwcC1yb290LXBhdGgnO1xyXG5pbXBvcnQgY29va2llUGFyc2VyIGZyb20gJ2Nvb2tpZS1wYXJzZXInO1xyXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcclxuaW1wb3J0IGNzdXJmIGZyb20gJ2NzdXJmJztcclxuaW1wb3J0IGV4cHJlc3MsIHsgUmVxdWVzdEhhbmRsZXIsIGpzb24sIHVybGVuY29kZWQgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgaGVsbWV0IGZyb20gJ2hlbG1ldCc7XHJcbmltcG9ydCB7IGNyZWF0ZVByb3h5TWlkZGxld2FyZSB9IGZyb20gJ2h0dHAtcHJveHktbWlkZGxld2FyZSc7XHJcbmltcG9ydCBtdXN0YWNoZUV4cHJlc3MgZnJvbSAnbXVzdGFjaGUtZXhwcmVzcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuaW1wb3J0IHsgQXBpUm91dGVyIH0gZnJvbSAnLi9hcGktcm91dGVyLmpzJztcclxuaW1wb3J0IHsgQXV0aFJvdXRlciwgYXV0aEFuZEdldFJvbGUsIGNoZWNrQWRtaW4gfSBmcm9tICcuL2F1dGhvcml6YXRpb24uanMnO1xyXG5pbXBvcnQgb3JtIGZyb20gJy4vZGF0YWJhc2UuanMnO1xyXG5pbXBvcnQgeyBnZXRNZXRhRnJvbVBhdGhBbmRTYW5pdGl6ZSB9IGZyb20gJy4vbWV0YS5qcyc7XHJcbmltcG9ydCB7IHByZWNoZWNrIH0gZnJvbSAnLi9wcmVjaGVjay5qcyc7XHJcbmltcG9ydCB7IFJlc2l6ZWQgfSBmcm9tICcuL3Jlc2l6ZWQuanMnO1xyXG5pbXBvcnQgeyBBZG1pblJlc3QgfSBmcm9tICcuL3Jlc3QuanMnO1xyXG5pbXBvcnQgdHlwZSB7IE9wdGlvbnMgfSBmcm9tICdwaW5vLWh0dHAnO1xyXG5cclxuY29uc3QgbWFpbiA9IGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHByZWNoZWNrKCk7XHJcblxyXG4gICAgY29uc3QgaXNQcm9kdWN0aW9uID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcclxuXHJcbiAgICBpZiAoIXByb2Nlc3MuZW52LlBPUlQpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcignTm8gcG9ydCBudW1iZXIgc3BlY2lmaWVkIGluIGVudmlyb25tZW50YWwgdmFyaWFibGVzJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuUE9SVCwgMTApO1xyXG5cclxuICAgIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcclxuICAgIGNvbnN0IGxvZ2dlciA9IGF3YWl0IChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzUHJvZHVjdGlvbikge1xyXG4gICAgICAgICAgICBjb25zdCB7IHBpbm8gfSA9IGF3YWl0IGltcG9ydCgncGlubycpO1xyXG4gICAgICAgICAgICBjb25zdCB7IHBpbm9IdHRwIH0gPSBhd2FpdCBpbXBvcnQoJ3Bpbm8taHR0cCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGlub0h0dHAoe1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyOiBwaW5vKCksXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcTogcGluby5zdGRTZXJpYWxpemVycy5yZXEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzOiBwaW5vLnN0ZFNlcmlhbGl6ZXJzLnJlcyxcclxuICAgICAgICAgICAgICAgICAgICBlcnI6IHBpbm8uc3RkU2VyaWFsaXplcnMuZXJyLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSBhcyBPcHRpb25zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IG1vcmdhbiB9ID0gYXdhaXQgaW1wb3J0KCdtb3JnYW4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vcmdhbignZGV2Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSkoKTtcclxuXHJcbiAgICAvLyBTdHVwaWQgZmF2aWNvblxyXG4gICAgYXdhaXQgKGFzeW5jICgpID0+IHtcclxuICAgICAgICBpZiAoIWlzUHJvZHVjdGlvbikge1xyXG4gICAgICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IGZhdiB9ID0gYXdhaXQgaW1wb3J0KCdzZXJ2ZS1mYXZpY29uJyk7XHJcbiAgICAgICAgICAgIGFwcC51c2UoZmF2KHBhdGgucmVzb2x2ZShwcm9jZXNzLmVudi5JTUFHRV9BU1NFVFNfRElSIHx8ICcuLycsICdmYXZpY29uLnBuZycpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSkoKTtcclxuXHJcbiAgICBhcHAudXNlKGxvZ2dlcik7XHJcblxyXG4gICAgLy8gaGVsbWV0IHdpbGwgYWRkIEhTVFMgdG8gZm9yY2UgSFRUUFMgY29ubmVjdGlvbnMsIHJlbW92ZSB4LXBvd2VyZWQtYnkgbm9uLXN0YW5kYXJkIGhlYWRlcixcclxuICAgIC8vIHNldHMgeC1mcmFtZS1vcHRpb25zIGhlYWRlciB0byBkaXNhbGxvdyBvdXIgY29udGVudCB0byBiZSByZW5kZXJlZCBpbiBpZnJhbWVzLlxyXG4gICAgYXBwLnVzZShoZWxtZXQoe1xyXG4gICAgICAgIGNvbnRlbnRTZWN1cml0eVBvbGljeToge1xyXG4gICAgICAgICAgICBkaXJlY3RpdmVzOiB7XHJcbiAgICAgICAgICAgICAgICAnc2NyaXB0LXNyYy1hdHRyJzogbnVsbCxcclxuICAgICAgICAgICAgICAgICdzY3JpcHQtc3JjJzogW1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJ3NlbGYnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCIndW5zYWZlLWlubGluZSdcIixcclxuICAgICAgICAgICAgICAgICAgICBcIid1bnNhZmUtZXZhbCdcIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHA6Ly9sb2NhbGhvc3Q6NTE3M1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9qcy5zdHJpcGUuY29tXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovL2NoZWNrb3V0LnN0cmlwZS5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGlcIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3MvcGxheWVyL1wiLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICdkZWZhdWx0LXNyYyc6IFtcclxuICAgICAgICAgICAgICAgICAgICBcIidzZWxmJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9qcy5zdHJpcGUuY29tL3YzL1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20veW91dHViZS92My9cIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICdpbWctc3JjJzogW1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiJ3NlbGYnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczpcIixcclxuICAgICAgICAgICAgICAgICAgICBcImRhdGE6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJodHRwczovL2kueXRpbWcuY29tL3ZpL1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiaHR0cHM6Ly8qLnN0cmlwZS5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcImh0dHBzOi8vKi5nb29nbGVhcGlzLmNvbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwiaHR0cHM6Ly8qLmdzdGF0aWMuY29tXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCIqLmdvb2dsZS5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcIiouZ29vZ2xldXNlcmNvbnRlbnQuY29tXCJcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAnY29ubmVjdC1zcmMnOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgXCInc2VsZidcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndzOi8vbG9jYWxob3N0OjUxNzMvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovL2FwaS5zdHJpcGUuY29tXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovL2NoZWNrb3V0LnN0cmlwZS5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjMvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovLyouZ29vZ2xlYXBpcy5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICBcIiouZ29vZ2xlLmNvbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiKi5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICBcImh0dHBzOi8vKi5nc3RhdGljLmNvbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YTpcIixcclxuICAgICAgICAgICAgICAgICAgICBcImJsb2I6XCIsXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgJ2ZyYW1lLXNyYyc6IFtcclxuICAgICAgICAgICAgICAgICAgICBcIidzZWxmJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9qcy5zdHJpcGUuY29tXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovL3d3dy55b3V0dWJlLmNvbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9ob29rcy5zdHJpcGUuY29tXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJodHRwczovL2NoZWNrb3V0LnN0cmlwZS5jb21cIlxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3Jvc3NPcmlnaW5FbWJlZGRlclBvbGljeTogZmFsc2VcclxuICAgIH0pKTtcclxuXHJcbiAgICBjb25zdCBvcm1IYW5kbGVyOiBSZXF1ZXN0SGFuZGxlciA9IChfLCBfXywgbmV4dCkgPT4ge1xyXG4gICAgICAgIFJlcXVlc3RDb250ZXh0LmNyZWF0ZShvcm0uZW0sIG5leHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vbi1hZG1pbiByb3V0ZXMuXHJcbiAgICAvLyBEb24ndCBpbmplY3QgYm9keVBhcnNlciB1bmxlc3MgbmVlZGVkXHJcbiAgICAvLyBhbmQgbm9uLWFkbWluIHJvdXRlcyBkb24ndCBuZWVkIFBPU1RcclxuICAgIGFwcC51c2UoL1xcL2FwaS8sIG9ybUhhbmRsZXIsIEFwaVJvdXRlcik7XHJcblxyXG4gICAgLy8gb25seSBmb3IgZGV2XHJcbiAgICAvLyBwcm9kIHVzZXMgbmdpbnggdG8gc2VydmUgc3RhdGljIGZpbGVzXHJcbiAgICBpZiAoIWlzUHJvZHVjdGlvbikge1xyXG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuTVVTSUNfQVNTRVRTX0RJUiB8fCAhcHJvY2Vzcy5lbnYuSU1BR0VfQVNTRVRTX0RJUikge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignTmVjZXNzYXJ5IGVudmlyb25tZW50YWwgdmFyaWFibGVzIG5vdCBmb3VuZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhcHAudXNlKCcvc3RhdGljL211c2ljJywgZXhwcmVzcy5zdGF0aWMocGF0aC5yZXNvbHZlKHJvb3RQYXRoLnRvU3RyaW5nKCksIHByb2Nlc3MuZW52Lk1VU0lDX0FTU0VUU19ESVIpKSk7XHJcbiAgICAgICAgYXBwLnVzZSgnL3N0YXRpYy9pbWFnZXMnLCBleHByZXNzLnN0YXRpYyhwYXRoLnJlc29sdmUocm9vdFBhdGgudG9TdHJpbmcoKSwgcHJvY2Vzcy5lbnYuSU1BR0VfQVNTRVRTX0RJUikpKTtcclxuICAgICAgICBhcHAudXNlKCcvc3RhdGljJywgZXhwcmVzcy5zdGF0aWMocGF0aC5yZXNvbHZlKHJvb3RQYXRoLnRvU3RyaW5nKCksICdhc3NldHMnKSkpO1xyXG4gICAgICAgIC8vIGFwcC51c2UoJy9zdGF0aWMnLCBleHByZXNzLnN0YXRpYyhwYXRoLnJlc29sdmUocm9vdFBhdGgudG9TdHJpbmcoKSwgJ3dlYi9idWlsZCcpKSk7XHJcbiAgICAgICAgYXBwLnVzZSgnL3N0YXRpYycsIGNyZWF0ZVByb3h5TWlkZGxld2FyZSh7XHJcbiAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsXHJcbiAgICAgICAgICAgIHdzOiB0cnVlLFxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuXHJcbiAgICBhcHAuZW5naW5lKCdodG1sJywgbXVzdGFjaGVFeHByZXNzKCkpO1xyXG4gICAgYXBwLnNldCgndmlldyBlbmdpbmUnLCAnaHRtbCcpO1xyXG4gICAgYXBwLnNldCgndmlld3MnLCBwYXRoLnJlc29sdmUocm9vdFBhdGgudG9TdHJpbmcoKSwgJ3BhcnRpYWxzJykpO1xyXG5cclxuICAgIGNvbnN0IGNzcmZIYW5kbGVyID0gY3N1cmYoe1xyXG4gICAgICAgIGNvb2tpZToge1xyXG4gICAgICAgICAgICBzaWduZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIHNlY3VyZTogdHJ1ZSxcclxuICAgICAgICAgICAgaHR0cE9ubHk6IHRydWUsXHJcbiAgICAgICAgICAgIHNhbWVTaXRlOiAnc3RyaWN0JyxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGFsbG93ZWRPcmlnaW5zID0gWy9sb2NhbGhvc3Q6XFxkezR9JC8sIC9odHRwczpcXC9cXC9cXHcqLmdvb2dsZWFwaXNcXC5jb20uKi9dO1xyXG4gICAgaWYgKHByb2Nlc3MuZW52LkNPUlNfT1JJR0lOUykge1xyXG4gICAgICAgIGFsbG93ZWRPcmlnaW5zID0gYWxsb3dlZE9yaWdpbnMuY29uY2F0KHByb2Nlc3MuZW52LkNPUlNfT1JJR0lOUy5zcGxpdCgnLCcpLm1hcCh2ID0+IG5ldyBSZWdFeHAodikpKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb3JzT3B0aW9ucyA9IHtcclxuICAgICAgICBvcmlnaW46IGFsbG93ZWRPcmlnaW5zLFxyXG4gICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQXV0aG9yaXphdGlvbicsICdYLVJlcXVlc3RlZC1XaXRoJywgJ0NvbnRlbnQtVHlwZScsICdYLVRvdGFsLUNvdW50JywgJ09yaWdpbicsICdBY2NlcHQnXSxcclxuICAgICAgICBvcHRpb25zU3VjY2Vzc1N0YXR1czogMjA0LFxyXG4gICAgICAgIG1heEFnZTogODY0MDAsXHJcbiAgICAgICAgY3JlZGVudGlhbHM6IHRydWUsXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICghcHJvY2Vzcy5lbnYuQ09PS0lFX1NFQ1JFVCkge1xyXG4gICAgICAgIHRocm93IEVycm9yKCdObyBjb29raWUgc2VjcmV0IHNwZWNpZmllZCBpbiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGFkbWluTWlkZGxld2FyZXMgPSBbXHJcbiAgICAgICAgY29ycyhjb3JzT3B0aW9ucyksXHJcbiAgICAgICAgY29va2llUGFyc2VyKHByb2Nlc3MuZW52LkNPT0tJRV9TRUNSRVQpLFxyXG4gICAgICAgIGNzcmZIYW5kbGVyLFxyXG4gICAgICAgIHVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSxcclxuICAgICAgICBqc29uKCksXHJcbiAgICBdO1xyXG5cclxuICAgIGFwcC51c2UoL1xcL2F1dGgvLCBhZG1pbk1pZGRsZXdhcmVzLCBBdXRoUm91dGVyKTtcclxuXHJcbiAgICAvLyBDdXN0b20gYXBpIGVuZHBvaW50XHJcbiAgICBhcHAudXNlKFxyXG4gICAgICAgIC9cXC9yZXN0LyxcclxuICAgICAgICBhZG1pbk1pZGRsZXdhcmVzLFxyXG4gICAgICAgIG9ybUhhbmRsZXIsXHJcbiAgICAgICAgYXV0aEFuZEdldFJvbGUsXHJcbiAgICAgICAgY2hlY2tBZG1pbixcclxuICAgICAgICBBZG1pblJlc3RcclxuICAgICk7XHJcblxyXG4gICAgLy8gUmVzaXplIGltYWdlc1xyXG4gICAgYXBwLnVzZSgvXFwvcmVzaXplZC8sIFJlc2l6ZWQpO1xyXG5cclxuICAgIGlmICghcHJvY2Vzcy5lbnYuQURNSU5fUE9SVCkge1xyXG4gICAgICAgIHRocm93IEVycm9yKCdObyBhZG1pbiBwb3J0IHNwZWNpZmllZCBpbiBlbnZpcm9ubWVudGFsIHZhcmlhYmxlcy4nKTtcclxuICAgIH1cclxuICAgIC8vIEFkbWluXHJcbiAgICBhcHAudXNlKFxyXG4gICAgICAgIC9cXC9hZG1pbi8sXHJcbiAgICAgICAgY29ycyhjb3JzT3B0aW9ucyksXHJcbiAgICAgICAgY29va2llUGFyc2VyKHByb2Nlc3MuZW52LkNPT0tJRV9TRUNSRVQpLFxyXG4gICAgICAgIGNzcmZIYW5kbGVyLFxyXG4gICAgICAgIGNyZWF0ZVByb3h5TWlkZGxld2FyZSh7XHJcbiAgICAgICAgICAgIHRhcmdldDogYGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9jZXNzLmVudi5BRE1JTl9QT1JUfWAsXHJcbiAgICAgICAgICAgIHdzOiB0cnVlLFxyXG4gICAgICAgICAgICBvblByb3h5UmVxOiAocHJveHlSZXEsIHJlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdjc3JmLWluamVjdCcsIHJlcS5jc3JmVG9rZW4oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgICk7XHJcblxyXG4gICAgLy8gSGVhbHRoLWNoZWNrIGVuZHBvaW50LlxyXG4gICAgYXBwLmdldCgnL2hlYWx0aC1jaGVjaycsIChfcmVxLCByZXMpID0+IHJlcy5zZW5kU3RhdHVzKDIwMCkpO1xyXG5cclxuICAgIGlmICghaXNQcm9kdWN0aW9uKSB7XHJcbiAgICAgICAgYXBwLmdldCgnL3BpYW5vbm90ZXMnLCAoX3JlcSwgcmVzKSA9PiByZXMucmVkaXJlY3QoJ2h0dHBzOi8vc2VhbmNoZW5waWFuby5jb20vcGlhbm9ub3RlcycpKTtcclxuICAgIH1cclxuXHJcbiAgICBhcHAuZ2V0KFxyXG4gICAgICAgIC9cXC8vLFxyXG4gICAgICAgIGNvcnMoY29yc09wdGlvbnMpLFxyXG4gICAgICAgIGNvb2tpZVBhcnNlcihwcm9jZXNzLmVudi5DT09LSUVfU0VDUkVUKSxcclxuICAgICAgICBjc3JmSGFuZGxlcixcclxuICAgICAgICBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICAgICAgZGVsZXRlIHJlcS5xdWVyeS5mYmNsaWQ7ICAgIC8vIE5PIEZBQ0VCT09LXHJcbiAgICAgICAgICAgIGNvbnN0IHsgc2FuaXRpemUgPSAnJywgLi4ubWV0YSB9ID0gYXdhaXQgZ2V0TWV0YUZyb21QYXRoQW5kU2FuaXRpemUocmVxLnBhdGgsIHJlcS5xdWVyeS5xIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgIGlmIChzYW5pdGl6ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLnJlZGlyZWN0KHJlcS51cmwucmVwbGFjZShgLyR7c2FuaXRpemV9YCwgJycpKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1ldGEuaW1hZ2UgPSBtZXRhLmltYWdlID8/IGBodHRwczovLyR7cmVxLmdldCgnaG9zdCcpfS9zdGF0aWMvaW1hZ2VzL3N5Y19jaGFpcl9tZXRhLmpwZ2A7XHJcbiAgICAgICAgICAgICAgICByZXMucmVuZGVyKCdpbmRleCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjc3JmOiByZXEuY3NyZlRva2VuKCksXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ubWV0YSxcclxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyOiBtZXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIGZhY2Vib29rOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLm1ldGEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBtZXRhLmltYWdlLnJlcGxhY2UoJ2h0dHBzJywgJ2h0dHAnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VjdXJlX2ltYWdlOiBtZXRhLmltYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICdodHRwczovLycgKyByZXEuZ2V0KCdob3N0JykgKyByZXEub3JpZ2luYWxVcmxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHZpdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmdsb2JhbCA9IHdpbmRvdztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnQgUmVmcmVzaFJ1bnRpbWUgZnJvbSAnaHR0cDovL2xvY2FsaG9zdDo1MTczL0ByZWFjdC1yZWZyZXNoJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWZyZXNoUnVudGltZS5pbmplY3RJbnRvR2xvYmFsSG9vayh3aW5kb3cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy4kUmVmcmVzaFJlZyQgPSAoKSA9PiB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuJFJlZnJlc2hTaWckID0gKCkgPT4gKHR5cGUpID0+IHR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Ll9fdml0ZV9wbHVnaW5fcmVhY3RfcHJlYW1ibGVfaW5zdGFsbGVkX18gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY3M6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gaWYgZGV2ZWxvcG1lbnQgLS0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBzcmM9XCJodHRwOi8vbG9jYWxob3N0OjUxNzMvQHZpdGUvY2xpZW50XCI+PC9zY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBzcmM9XCJodHRwOi8vbG9jYWxob3N0OjUxNzMvbWFpbi50c3hcIj48L3NjcmlwdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGhvc3QgPSBwcm9jZXNzLmVudi5IT1NUID8/ICcxMjcuMC4wLjEnO1xyXG5cclxuICAgIGFwcC5saXN0ZW4ocG9ydCwgaG9zdCwgKCkgPT4gY29uc29sZS5sb2coYEFwcCBsaXN0ZW5pbmcgb24gcG9ydCAke3BvcnR9LmApKTtcclxuXHJcbiAgICBpZiAoIWlzUHJvZHVjdGlvbikge1xyXG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuREVWX0hUVFBTX0NFUlRfUEFUSCB8fCAhcHJvY2Vzcy5lbnYuREVWX0hUVFBTX1BPUlQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05lY2Vzc2FyeSBlbnYgcGF0aHMgbm90IGZvdW5kIGZvciBIVFRQUzsgb25seSB1c2luZyBIVFRQLicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRldlBvcnQgPSBwYXJzZUludChwcm9jZXNzLmVudi5ERVZfSFRUUFNfUE9SVCwgMTApO1xyXG4gICAgICAgICAgICBjb25zdCBodHRwcyA9IGF3YWl0IGltcG9ydCgnaHR0cHMnKTtcclxuICAgICAgICAgICAgY29uc3QgaHR0cHNPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LkRFVl9IVFRQU19DRVJUX1BBVEgsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NlcnQua2V5J1xyXG4gICAgICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgICAgICBjZXJ0OiByZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LkRFVl9IVFRQU19DRVJUX1BBVEgsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NlcnQucGVtJ1xyXG4gICAgICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGh0dHBzLmNyZWF0ZVNlcnZlcihodHRwc09wdGlvbnMsIGFwcCk7XHJcbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4oZGV2UG9ydCwgaG9zdCwgKCkgPT4gY29uc29sZS5sb2coYEFwcCBsaXN0ZW5pbmcgZm9yIGh0dHBzIG9uIHBvcnQgJHtkZXZQb3J0fS5gKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG5cclxubWFpbigpO1xyXG4iXSwibmFtZXMiOlsiUmVxdWVzdENvbnRleHQiLCJyb290UGF0aCIsImNvb2tpZVBhcnNlciIsImNvcnMiLCJjc3VyZiIsImV4cHJlc3MiLCJqc29uIiwidXJsZW5jb2RlZCIsInJlYWRGaWxlU3luYyIsImhlbG1ldCIsImNyZWF0ZVByb3h5TWlkZGxld2FyZSIsIm11c3RhY2hlRXhwcmVzcyIsInBhdGgiLCJBcGlSb3V0ZXIiLCJBdXRoUm91dGVyIiwiYXV0aEFuZEdldFJvbGUiLCJjaGVja0FkbWluIiwib3JtIiwiZ2V0TWV0YUZyb21QYXRoQW5kU2FuaXRpemUiLCJwcmVjaGVjayIsIlJlc2l6ZWQiLCJBZG1pblJlc3QiLCJtYWluIiwiaXNQcm9kdWN0aW9uIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiUE9SVCIsIkVycm9yIiwicG9ydCIsInBhcnNlSW50IiwiYXBwIiwibG9nZ2VyIiwicGlubyIsInBpbm9IdHRwIiwic2VyaWFsaXplcnMiLCJyZXEiLCJzdGRTZXJpYWxpemVycyIsInJlcyIsImVyciIsImRlZmF1bHQiLCJtb3JnYW4iLCJmYXYiLCJ1c2UiLCJyZXNvbHZlIiwiSU1BR0VfQVNTRVRTX0RJUiIsImNvbnRlbnRTZWN1cml0eVBvbGljeSIsImRpcmVjdGl2ZXMiLCJjcm9zc09yaWdpbkVtYmVkZGVyUG9saWN5Iiwib3JtSGFuZGxlciIsIl8iLCJfXyIsIm5leHQiLCJjcmVhdGUiLCJlbSIsIk1VU0lDX0FTU0VUU19ESVIiLCJzdGF0aWMiLCJ0b1N0cmluZyIsInRhcmdldCIsIndzIiwiZW5naW5lIiwic2V0IiwiY3NyZkhhbmRsZXIiLCJjb29raWUiLCJzaWduZWQiLCJzZWN1cmUiLCJodHRwT25seSIsInNhbWVTaXRlIiwiYWxsb3dlZE9yaWdpbnMiLCJDT1JTX09SSUdJTlMiLCJjb25jYXQiLCJzcGxpdCIsIm1hcCIsInYiLCJSZWdFeHAiLCJjb3JzT3B0aW9ucyIsIm9yaWdpbiIsImFsbG93ZWRIZWFkZXJzIiwib3B0aW9uc1N1Y2Nlc3NTdGF0dXMiLCJtYXhBZ2UiLCJjcmVkZW50aWFscyIsIkNPT0tJRV9TRUNSRVQiLCJhZG1pbk1pZGRsZXdhcmVzIiwiZXh0ZW5kZWQiLCJBRE1JTl9QT1JUIiwib25Qcm94eVJlcSIsInByb3h5UmVxIiwic2V0SGVhZGVyIiwiY3NyZlRva2VuIiwiZ2V0IiwiX3JlcSIsInNlbmRTdGF0dXMiLCJyZWRpcmVjdCIsInF1ZXJ5IiwiZmJjbGlkIiwic2FuaXRpemUiLCJtZXRhIiwicSIsInVybCIsInJlcGxhY2UiLCJlbmQiLCJpbWFnZSIsInJlbmRlciIsImNzcmYiLCJ0d2l0dGVyIiwiZmFjZWJvb2siLCJzZWN1cmVfaW1hZ2UiLCJvcmlnaW5hbFVybCIsInZpdGUiLCJyZWZyZXNoIiwic3JjcyIsImhvc3QiLCJIT1NUIiwibGlzdGVuIiwiY29uc29sZSIsImxvZyIsIkRFVl9IVFRQU19DRVJUX1BBVEgiLCJERVZfSFRUUFNfUE9SVCIsImRldlBvcnQiLCJodHRwcyIsImh0dHBzT3B0aW9ucyIsImtleSIsImNlcnQiLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sbUJBQW1CO0FBRTFCLFNBQVNBLGNBQWMsUUFBUSxrQkFBa0I7QUFDakQsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0Msa0JBQWtCLGdCQUFnQjtBQUN6QyxPQUFPQyxVQUFVLE9BQU87QUFDeEIsT0FBT0MsV0FBVyxRQUFRO0FBQzFCLE9BQU9DLFdBQTJCQyxJQUFJLEVBQUVDLFVBQVUsUUFBUSxVQUFVO0FBQ3BFLFNBQVNDLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLFlBQVksU0FBUztBQUM1QixTQUFTQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFDOUQsT0FBT0MscUJBQXFCLG1CQUFtQjtBQUMvQyxPQUFPQyxVQUFVLE9BQU87QUFFeEIsU0FBU0MsU0FBUyxRQUFRLGtCQUFrQjtBQUM1QyxTQUFTQyxVQUFVLEVBQUVDLGNBQWMsRUFBRUMsVUFBVSxRQUFRLHFCQUFxQjtBQUM1RSxPQUFPQyxTQUFTLGdCQUFnQjtBQUNoQyxTQUFTQywwQkFBMEIsUUFBUSxZQUFZO0FBQ3ZELFNBQVNDLFFBQVEsUUFB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