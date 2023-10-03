/* eslint-disable no-var, strict, prefer-arrow-callback */
const path = require('path');

function getName() {
    const folderName = path.parse(process.cwd()).name;
    return folderName;
}

module.exports = {
    apps: [
        {
            name: getName(),
            script: 'yarn',
            args: 'start',
            exec_mode: 'fork',
            interpreter: 'bash',
            watch: [
                'packages/server/build',
                'packages/common/dist',
                '../www/assets/partials/prod',
            ],
            watch_delay: 1000,
            exp_backoff_restart_delay: 100,
            stop_exit_codes: [0],
            log_date_format: 'YYYY-MM-DD HH:mm Z',
        },
    ],
};
