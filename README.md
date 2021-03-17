# The official web page of pianist Sean Chen.

This website backend is an [express](http://expressjs.com/) app with a PostgreSQL database. The frontend is built with [react](https://facebook.github.io/react/) and bundled with [webpack](https://webpack.github.io/). Use [yarn](https://yarnpkg.com/en/) or npm for package management. Code is in [typescript](https://www.typescriptlang.org/) and styling is done by [emotion](https://github.com/emotion-js/emotion). Admin of the database is administered by [ForestAdmin](https://github.com/ForestAdmin).

## Getting Started
Make sure at least version 12 of Node.js is installed.

### Env file

Setup a .env file with at least these entries:
```
DB_NAME=<database name, probably sycpiano, needed on prod>
DB_HOST=<production host, probably localhost/127.0.0.1, needed on prod>
DB_USER=<username>
DB_PASS=<password>
DB_PORT=<database port, needed on prod>
PORT=<http port number, needed on prod>
FOREST_ENV_SECRET=<secret for using forest admin>
FOREST_AUTH_SECRET=<secret for auth forest admin>
GAPI_KEY_SERVER=<from google developer console>
GAPI_KEY_APP=<from google developer console>
STRIPE_SECRET_KEY=<from stripe dashboard>
STRIPE_PUBLIC_KEY=<from stripe dashboard>
STRIPE_WEBHOOK_KEY=<from stripe dashboard>
EMAIL_PASSWORD=<your smtp password for nodemailer>
PRODUCTS_DIR=<absolute path to emailable assets>
SEED_DATA_DIR=<absolute path to seeding data, only for first run of database>
IMAGE_ASSETS_DIR=<absolute path to image assets folder>
MUSIC_ASSETS_DIR=<absolute path to music assets folder>
DKIM_PRIVATE_KEY=<path to private PEM formatted key, should be at least 1024bit rsa>
```

## Development

After you've cloned the repository and have navigated to the project root, run:
```
$ yarn
```
After installing your node dependencies, you're ready to start dev process.
```
$ yarn run watchDevMin
```
This command will run a gulp task that starts the server and watches for changes you make to your code, in which case it will trigger a rebuild as well as reload the main app.

If you would like to also lint and check the typescript of the frontend and backend, you can just run on windows:
```
$ yarn windowsDev
```
or use tmux or any other way to run the following in separate windows/panes:
```
$ yarn watchAndCheckApp
$ yarn watchAndCheckServer
```

N.B. on Windows, make sure you add %LocalAppData%\Yarn to your whitelist for antivirus and/or Windows Defender, or else installs take forever!

The app will be served on `localhost:8000` and the webpack-bundle-analyzer will be on `localhost:8888`.

## Production
Run:
```
$ yarn run startProd
```
Automation on the server is done by [pm2](http://pm2.keymetrics.io/). Further, bash scripts for building and running the app are included in `./bin`.

## Initializing the database
The website uses a PostgreSQL database, and connects to it using [sequelize](http://docs.sequelizejs.com/en/v3/).
Here are the steps for seeding the database:
* Install PostgreSQL for your OS
* Using the root user, open up a psql shell. On windows, the user's name will be `postgres`. On OSX, if you installed postgres through `brew`, then it'll be whatever your root user's name is. On linux, you'll need to switch to the postgres user by doing `su - postgres` in order to connect to the postgres server as the postgres user (i.e. the postgres user and the linux user have to match). One way to find out is to do `psql -l` and see who the owner of the `postgres` database is. Once you've figured out the root user, run this command:
```bash
$ psql -U <username>
```
* In the psql shell, create a new database called `sycpiano`
```psql
postgres=# create database sycpiano;
# This should also automatically switch to using the new database, but whatever.
postgres=# \connect sycpiano;
```
* In the postgres shell, create a new user
```
create role <username> with login password '<quoted password>'
```

## Migrations and Seeding
Before seeding the calendar, make sure to obtain a service account key file (json) from google developer console. Save the key under `server/gapi-key.json`. This file is also in our `.gitignore`. The json file should contain two fields, `client_email` and `private_key`.

sycpiano uses umzug and sequelize for migrations.
```
$ node server/build/migrate [up|down|prev|next] [(if up or down) migration-file]
$ node server/build/seed [up|down|prev|next] [(if up or down) seeder-file]
```

Make sure to build the server files first by running `yarn run buildServer`, and also make sure your Postgresql server is up and running.

## Admin
sycpiano uses the Forest admin for managing the database.

Going to `/admin` will forward you to the forest admin website.

## Utilities

### Audio Waveforms
There is a waveform generation utility script included in ./scripts called genWaveform.sh.
```
$ genWaveform.sh -i input.mp3 -l desiredWaveformLength
```
Must have the [audiowaveform](https://github.com/bbc/audiowaveform) package installed (linux or macosx only, windows via WSL). Only does mp3 files. For now, `desiredWaveformLength = 1024`.

### Picture Thumbnails
There is a thumbanil generation utility (and creates .json file for seeding the photos table in the database) in ./scripts called generateThumbnails.js
```
$ node ./scripts/generateThumbnails
```
Must have [graphicsmagick](http://www.graphicsmagick.org/), [imagemagick](https://www.imagemagick.org/script/index.php), and [opencv](https://github.com/opencv) installed, which are not included in the `package.json`.