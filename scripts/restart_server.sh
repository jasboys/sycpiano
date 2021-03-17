export NODE_ENV=production;
export PORT=8080;
yarn install;
yarn run build-server;
node server/build/migrate up;
node server/build/seed up;
pm2 restart sycpiano;
