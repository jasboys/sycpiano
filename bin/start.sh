yarn run build-prod;
node server/build/migrate up;
export NODE_ENV='production';
export PORT=443;
yarn start;
