const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const mustacheExpress = require('mustache-express');
const ApiRouter = require('./server/build/api-router.js').ApiRouter;
const AdminRest = require('./server/build/rest.js').AdminRest;
const Resized = require('./server/build/resized.js').Resized;
const getMetaFromPathAndSanitize = require('./server/build/meta.js').getMetaFromPathAndSanitize;

const isProduction = process.env.NODE_ENV === 'production';

const port = isProduction ? process.env.PORT : 8000;
const listenAddr = isProduction ? '0.0.0.0' : '127.0.0.1';

const app = express();
const logger = () => {
    if (isProduction) {
        const pino = require('express-pino-logger');
        return pino({
            serializers: {
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res,
                err: pino.stdSerializers.err,
            }
        });
    } else {
        return require('morgan')('dev');
    }
};

app.use(logger());

// helmet will add HSTS to force HTTPS connections, remove x-powered-by non-standard header,
// sets x-frame-options header to disallow our content to be rendered in iframes.
app.use(helmet());

// Non-admin routes.
// Don't inject bodyParser unless needed
app.use(/\/api/, ApiRouter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

// only for dev
// prod uses nginx to serve static files
app.use('/static/music', express.static(path.resolve(process.env.MUSIC_ASSETS_DIR)));
app.use('/static/images', express.static(path.resolve(process.env.IMAGE_ASSETS_DIR)));
app.use('/static', express.static(path.join(__dirname, '/web/assets')));
app.use('/static', express.static(path.join(__dirname, '/web/build')));

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/web/build'));

// Matches the /admin route.
app.get(/\/admin/, (_, res) => res.redirect('https://app.forestadmin.com'));

// Extends Forest api
app.use(/\/rest/, AdminRest);

// Resize images.
app.use(/\/resized/, Resized);

// Health-check endpoint.
app.get('/health-check', (req, res) => res.sendStatus(200));

// Redirect old URLs that are indexed on google to base route.
const oldRoutesToRedirectsMap = {
    '/home': '/',
    '/music': '/media/music',
    '/about': '/about/biography',
    '/press': '/about/press',
};

Object.keys(oldRoutesToRedirectsMap).forEach(key => (
    app.get(key, (req, res) => res.redirect(oldRoutesToRedirectsMap[key]))
));

// We catch any route first, and then let our front-end routing do the work.
app.get(/\//, async (req, res) => {
    if (isProduction && req.get('host').match(/^www\..*/i) === null) {
        res.redirect(301, `https://www.${req.get('host')}${req.originalUrl}`);
    }
    delete req.query.fbclid;
    const { sanitize = '', notFound = false, ...meta } = await getMetaFromPathAndSanitize(req.path);
    if (notFound) {
        res.status(404);
    }
    if (sanitize) {
        res.redirect(req.url.replace(`/${sanitize}`, ''));
        res.end();
    } else {
        if (!meta.image) {
            meta.image = 'https://www.seanchenpiano.com/static/images/syc_chair_meta.jpg';
        }
        res.render('index', {
            twitter: meta,
            facebook: {
                ...meta,
                image: meta.image.replace('https', 'http'),
                secure_image: meta.image,
                url: 'https://' + req.get('host') + req.originalUrl },
        });
    }
});

app.listen(port, listenAddr, () => console.log(`App listening on port ${port}.`));
