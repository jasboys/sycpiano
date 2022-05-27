import * as Promise from 'bluebird';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { MigrationParams, SequelizeStorage, Umzug, MigrationMeta, MigrateUpOptions, MigrateDownOptions } from 'umzug';

import sequelize, { options } from './sequelize';

const umzug = new Umzug({
    storage: new SequelizeStorage({
        sequelize,
        modelName: 'migrations',
    }),
    migrations: {
        glob: path.join(__dirname, 'migrations', '*.js'),
        resolve: ({ name, path, context }) => {
            if (!path) {
                throw new Error('no path');
            }
            /* eslint-disable-next-line @typescript-eslint/no-var-requires */
            const migration = require(path);
            return {
                // adjust the parameters Umzug will
                // pass to migration methods when called
                name,
                up: async () => migration.up(context, sequelize.constructor),
                down: async () => migration.down(context, sequelize.constructor),
            }
        },
    },
    context: sequelize.getQueryInterface(),
    logger: console,
});

const logUmzugEvent = (name: string) =>
    (eventData: MigrationParams<Sequelize.QueryInterface>) => {
        console.log(`${name} ${eventData.name}`);
    };

umzug.on('migrating', logUmzugEvent('migrating'));
umzug.on('migrated', logUmzugEvent('migrated'));
umzug.on('reverting', logUmzugEvent('reverting'));
umzug.on('reverted', logUmzugEvent('reverted'));

interface MigrationResult {
    executed?: MigrationMeta[];
    pending?: MigrationMeta[];
}

const cmdStatus = async () => {
    const result: MigrationResult = {};

    const executed = await umzug.executed();
    result.executed = executed;
    const pending = await umzug.pending();
    result.pending = pending;

    executed.forEach((migration, index, arr) => {
        if (migration.path) {
            arr[index].name = path.basename(migration.path, '.js');
        }
    });
    pending.forEach((migration, index, arr) => {
        if (migration.path) {
            arr[index].name = path.basename(migration.path, '.js');
        }
    });

    const current = executed.length > 0 ? executed[0].path : '<NO_MIGRATIONS>';
    const status = {
        current,
        executed: executed.map((m) => m.path),
        pending: pending.map((m) => m.path),
    };

    console.log(JSON.stringify(status, null, 2));

    return { executed, pending };
};

const cmdMigrate = (migration: MigrateUpOptions) => (
    umzug.up(migration)
);

const cmdMigrateNext = async () => {
    const { pending } = await cmdStatus();
    if (pending.length === 0) {
        return Promise.reject(new Error('No pending migrations'));
    } else {
        const next = pending[0].name!;
        return umzug.up({ to: next });
    }
};

const cmdReset = (migration: MigrateDownOptions) => {
    if (migration) {
        return umzug.down(migration);
    }
    return umzug.down({ to: 0 });
};

const cmdResetPrev = async () => {
    const { executed } = await cmdStatus();
    if (executed.length === 0) {
        return Promise.reject(new Error('Already at initial state'));
    }
    const prev = executed[executed.length - 1].name!;
    return umzug.down({ to: prev });
};

const cmdHardReset = () => (
    new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                console.log(options);
                const dbName = options.database;
                const dbUser = options.username;
                console.log(`dropdb ${dbName}`);
                childProcess.spawnSync(`dropdb ${dbName}`);
                console.log(`createdb ${dbName} --username ${dbUser}`);
                childProcess.spawnSync(`createdb ${dbName} --username ${dbUser}`);
                resolve();
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    })
);

const main = async () => {
    const cmd = process.argv[2].trim();
    const migration = (process.argv[3] === undefined) ?
        {} :
        { migrations: process.argv.slice(3).map((arg) => arg.trim()) };
    let executedCmd: Promise<any>;

    console.log(`${cmd.toUpperCase()} BEGIN`);
    switch (cmd) {
        case 'status':
            executedCmd = Promise.resolve(cmdStatus());
            break;

        case 'up':
        case 'migrate':
            executedCmd = Promise.resolve(cmdMigrate(migration));
            break;

        case 'next':
        case 'migrate-next':
            executedCmd = Promise.resolve(cmdMigrateNext());
            break;

        case 'down':
        case 'reset':
            executedCmd = Promise.resolve(cmdReset(migration));
            break;

        case 'prev':
        case 'reset-prev':
            executedCmd = Promise.resolve(cmdResetPrev());
            break;

        case 'reset-hard':
            executedCmd = cmdHardReset();
            break;

        default:
            console.log(`invalid cmd: ${cmd}`);
            process.exit(1);
    }
    try {
        await executedCmd;
        const doneStr = `${cmd.toUpperCase()} DONE`;
        console.log(doneStr);
        console.log('='.repeat(doneStr.length));
    } catch (err) {
        const errorStr = `${cmd.toUpperCase()} ERROR`;
        console.log(errorStr);
        console.log('='.repeat(errorStr.length));
        console.log(err);
        console.log('='.repeat(errorStr.length));
    }

    try {
        if (cmd !== 'status' && cmd !== 'reset-hard') {
            await cmdStatus();
        }
    } catch (e) {
        console.log(e);
    }
    process.exit(0);
};

main();
