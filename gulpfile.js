// gulpfile.js
const gulpNodemon = require('gulp-nodemon');
const gulp = require('gulp');
const fancyLog = require('fancy-log');
const PluginError = require('plugin-error');
const ts = require('gulp-typescript');
const webpack = require('webpack');
const format = require('util').format;
const path = require('path');
const fs = require('fs');
const del = require('del');
const { Transform } = require('stream');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const { MultiProgressBars } = require('multi-progress-bars');

let reporter;

const isProduction = process.env.NODE_ENV === 'production';

let ESLint, geslint, stylelint, stylelintFormatter, chalk, glob;

// Only need this in development
if (!isProduction) {
    ESLint = require('eslint').ESLint;
    geslint = require('gulp-eslint');
    stylelint = require('stylelint');
    stylelintFormatter = require('stylelint-formatter-pretty');
    chalk = require('chalk');
    glob = require('glob');
}

const devWebpackConfig = isProduction ? () => {} : require('./webpack.dev.config.js');

const prodWebpackConfig = isProduction ? require('./webpack.prod.config.js') : () => {};

const serverTsProject = ts.createProject('server/tsconfig.json');
const appTsProject = ts.createProject('tsconfig.json');

//
// BUILD APP SECTION
//

const buildApp = (done) => (
    webpack(prodWebpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
            if (err) {
                fancyLog.error('[webpack]', err.stack || err);
                if (err.details) {
                    fancyLog.error('[webpack]', err.details);
                }
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                fancyLog.error('[webpack][stats]', info.errors);
            }

            if (stats.hasWarnings()) {
                fancyLog.warn('[webpack][stats]', info.warnings);
            }
        }
        else {
            fancyLog('[webpack]', stats.toString('minimal'));
        }
        done();
    })
);

exports.buildApp = buildApp;

//
// BUILD SERVER SECTION
//

const cleanServer = async (done) => {
    await del([
        'server/build/**/*.js',
        '.resized-cache/*',
    ]);
    done();
};

const lintServer = () => {
    return gulp.src('server/src/**/*.ts')
        .pipe(geslint({
            configFile: 'server/.eslintrc.js',
            cache: true,
        }))
        .pipe(geslint.formatEach());
};

const checkServer = () => {
    return serverTsProject.src().pipe(serverTsProject(ts.reporter.defaultReporter()));
};

const compileServer = () => {
    return serverTsProject.src()
        .pipe(serverTsProject(ts.reporter.defaultReporter()))
        .on('error', () => { })
        .js
        .pipe(gulp.dest('./server/build'));
};

const compileServerNoCheck = () => {
    const count = glob.sync('server/src/**/*.ts').length;
    reporter.addTask('Compile Server', { type: 'percentage', barColorFn: chalk.blue, index: 1 });

    let counter = 0;
    const forEach = new Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform(chunk, _, callback) {
            counter++;
            reporter.updateTask('Compile Server', { percentage: counter / count, message: counter + '/' + count });
            callback(null, chunk);
        }
    });

    return serverTsProject.src()
        .pipe(forEach)
        .pipe(serverTsProject(ts.reporter.nullReporter()))
        .on('error', () => { })
        .js
        .pipe(gulp.dest('./server/build'))
        .on('finish', () => {
            reporter.done('Compile Server');
        });
};

const buildServer = gulp.series(
    // We don't need linting in production.
    isProduction ? cleanServer : gulp.parallel(lintServer, cleanServer),
    compileServer
);

exports.buildServer = buildServer;

// BUILD PROD

exports.buildProd = gulp.series(buildServer, buildApp);

//
// WATCH SECTION
//

let child;
let webpackWatcher = null;
let appPromiseResolve, serverPromiseResolve;
let appPromise, serverPromise;
let watchers = [];
let mainDone;

// Handle sigint
process.on('SIGINT', () => {
    child && child.kill();
    webpackWatcher && webpackWatcher.close();
    watchers.forEach((watcher) => {
        watcher.close();
    });
    treeKill(process.pid);
});

// Reset waiting for server build
const resetServerPromise = (cb) => {
    serverPromise = new Promise((res, _) => serverPromiseResolve = res);
    cb();
};

// Resolve the server build promise
const resolveServerPromise = (cb) => {
    serverPromiseResolve();
    cb();
};

// Main Webpack Watch function
const webpackWatch = (done) => {
    reporter.addTask('Webpack', { type: 'percentage', barColorFn: chalk.green, index: 2 });

    const compiler = webpack(devWebpackConfig(false, reporter));
    compiler.hooks.beforeRun.tapAsync('Reset Progress', (_) => {
        reporter.addTask('Webpack', { type: 'percentage', barColorFn: chalk.green, index: 2 });
        appPromise = new Promise((res, _) => appPromiseResolve = res);
    });

    webpackWatcher = compiler.watch({ ignored: /node_modules/ }, (err, stats) => {
        if (err) {
            throw new PluginError('webpack', err);
        }

        reporter.done('Webpack');

        reporter.promise.then(() => {
            console.log(chalk.blue('[webpack]\n') + stats.toString('minimal'));
        });
        appPromiseResolve?.();
    });

    done();
};

// This function replaces nodemon
// We kill existing app
// Then once progress bars are reset, we call mainDone, which allows the
// main watchDev function to finish the first part of the gulp.series.
// Then after everything is built, we spawn a new node running the app
const restartApp = async () => {
    try {
        let stdoutChunks = [], stderrChunks = [];
        child && treeKill(child.pid);
        reporter.addTask('Overall', { type: 'indefinite', barColorFn: chalk.white, index: 0 });
        reporter.updateTask('Overall', { message: 'Compiling' });
        // mainDone && mainDone();
        await Promise.all([appPromise, serverPromise]);
        reporter.updateTask('Overall', { message: 'Starting App' });
        child = spawn('node', ['./app.js']);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (data) => console.log(data));
        child.stderr.on('data', (data) => console.log(data));
        reporter.done('Overall', { message: chalk.yellow('Waiting for Changes...') });
    } catch (e) {
        reporter.close();
        process.stdout.write(e);
        // console.error(e);
    }
};

// Main Watch function
// Initialize progress bars,
// Watch server src and do rebuild steps
// Watch src files and run restart app (which waits for builds to complete)
// Then, once
const watchDev = gulp.series((done) => {
    reporter = new MultiProgressBars({ initMessage: 'Watch Dev', border: true, anchor: 'bottom', persist: true });
    watchers.push(
        gulp.watch(
            ['server/src/**/*'],
            { ignoreInitial: false },
            gulp.series(resetServerPromise, cleanServer, compileServerNoCheck, resolveServerPromise),
        )
    );
    watchers.push(
        gulp.watch(
            ['server/src/**/*', 'web/src/**/*', 'web/partials/*', 'app.js'],
            { ignoreInitial: false },
            restartApp,
        )
    );
    // mainDone = done;
    done();
}, webpackWatch);

const watchDevServer = gulp.series((done) => {
    reporter = new MultiProgressBars({ initMessage: 'Watch Dev', border: true, anchor: 'bottom', persist: true });
    watchers.push(
        gulp.watch(
            ['server/src/**/*'],
            { ignoreInitial: false },
            gulp.series(resetServerPromise, cleanServer, compileServerNoCheck, resolveServerPromise, restartApp),
        ),
        gulp.watch(
            ['app.js'],
            restartApp,
        )
    );
    done();
})

exports.watchDevServer = watchDevServer;
exports.watchDev = watchDev;

//
// LINTING AND TYPESCRIPT CHECKING SECTION
//

const watchAndCheckServer = (done) => {
    gulp.watch('server/src/**/*', { ignoreInitial: false }, gulp.series(lintServer, checkServer));
    done();
};

const lintApp = async () => {
    const styleResult = await stylelint.lint({
        files: 'web/src/**/*',
        formatter: stylelintFormatter,
    });
    console.log(styleResult.output)

    const eslint = new ESLint();
    const results = await eslint.lintFiles(['web/src/**/*']);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log(resultText);
};

const checkApp = () => {
    return appTsProject.src()
        .pipe(appTsProject(ts.reporter.defaultReporter()));
}

const watchAndCheckApp = (done) => {
    gulp.watch('web/src/**/*', { ignoreInitial: false }, gulp.series(lintApp, checkApp));
    done();
}

exports.watchAndCheckServer = watchAndCheckServer;
exports.watchAndCheckApp = watchAndCheckApp;