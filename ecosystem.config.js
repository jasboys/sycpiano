module.exports = {
    apps: [
        {
            name: "sycpiano",
            script: "yarn",
            args: "start",
            env: {
                NODE_ENV: "production",
            },
            log_date_format: "YYYY-MM-DD HH:mm Z"
        }
    ]
}