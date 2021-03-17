export NODE_ENV=production;
export PORT=8080;
yarn install;
yarn run build-prod;
node server/build/seed down;
node server/build/migrate up;
node server/build/seed up;
pm2 start app.js --name sycpiano;
