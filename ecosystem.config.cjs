/* eslint-disable no-var, strict, prefer-arrow-callback */

module.exports = {
    apps: [
        {
            name: 'sycpiano',
            script: 'yarn',
            args: 'node packages/server/build/app.js',
            exec_mode: 'fork',
            interpreter: '/bin/bash',
            watch: ['packages/server/build', 'packages/common/dist'],
            watch_delay: 1000,
            exp_backoff_restart_delay: 100,
            stop_exit_codes: [0],
            env: {
                NODE_ENV: 'production',
            },
            log_date_format: 'YYYY-MM-DD HH:mm Z',
        },
    ],
};
