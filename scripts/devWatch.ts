import webpack from 'webpack';
import PluginError from 'plugin-error';
import { MultiProgressBars } from 'multi-progress-bars';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import treeKill from 'tree-kill';
import which from 'which';


let webpackWatcher: webpack.Watching = null;
let child: ChildProcessWithoutNullStreams;
let nodemonProcess: ChildProcessWithoutNullStreams;

async function main() {
    const reporter = new MultiProgressBars({ initMessage: 'Watch Dev', border: true, anchor: 'bottom', persist: true });
    reporter.addTask('Nodemon', { type: 'indefinite', index: 2 });

    nodemonProcess = spawn(which.sync('yarn'), ['nodemon', '--config', 'nodemon.json', 'server/build/app.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
    });

    nodemonProcess.on('message', (event) => {
        if (event.type === 'start') {
            reporter.updateTask('Nodemon', { message: 'Nodemon started and watching...' });
        } else if (event.type === 'crash') {
            reporter.updateTask('Nodemon', { message: 'Process crashed, watching...' });
        }
    });
    nodemonProcess.stdout.setEncoding('utf8');
    nodemonProcess.stderr.setEncoding('utf8');
    nodemonProcess.stdout.on('data', (data) => {
        console.log(data);
        reporter.updateTask('Nodemon', { message: data.split('\n')[0] });
    });
    nodemonProcess.stderr.on('data', (data) => console.log(data));

    reporter.addTask('Webpack', { type: 'percentage', index: 1 });

    const devWebpackConfig = await import('../webpack.dev.config.js');

    const compiler = webpack(devWebpackConfig.default(reporter));

    webpackWatcher = compiler.watch({ ignored: /node_modules/ }, (err, stats) => {
        if (err) {
            throw new PluginError('webpack', err);
        }

        reporter.done('Webpack', { message: stats.toString('minimal').split('\n').join(' ') });
        console.log('[webpack]\n' + stats.toString('minimal'));
    });

    process.chdir('server')
    reporter.addTask('Backend', { type: 'percentage', index: 0, message: 'Starting Backend Build' });
    child = spawn(which.sync('yarn'), ['swc', 'src', '-d', 'build', '-w']);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        console.log(data);
        if ((data as string).includes('Success')) {
            reporter.done('Backend', { message: data.split('\n')[0] });
        }
    });
    child.stderr.on('data', (data) => console.log(data));
}

main();

process.on('SIGINT', () => {
    child && child.kill();
    webpackWatcher && webpackWatcher.close((closeErr) => {
        console.log('Webpack Watch Ended');
    });
    nodemonProcess && nodemonProcess.kill();
    treeKill(process.pid);
});