# This is the main script to invoke when booting the server on prod.
export NODE_ENV=production;
export PORT=8080;
yarn install;
yarn run build-prod;
node server/build/migrate up;
node server/build/seed up;
pm2 start pm2.json;
