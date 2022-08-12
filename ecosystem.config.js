/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

module.exports = {
    apps: [
        {
            name: "sycpiano",
            script: "yarn",
            args: "start",
            exec_mode: "fork",
            interpreter: "/bin/bash",
            env: {
                NODE_ENV: "production",
            },
            log_date_format: "YYYY-MM-DD HH:mm Z"
        }
    ]
}