FROM node:20-bookworm-slim AS base

FROM base AS depbase
WORKDIR /root
COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY ./.yarn/releases .yarn/releases
COPY ./packages/server/package.json packages/server/
COPY ./packages/common/package.json packages/common/

FROM depbase AS builder
WORKDIR /root
RUN yarn workspaces focus server
COPY ./packages/server packages/server
COPY ./packages/common packages/common
RUN yarn workspace common build
RUN yarn workspace server build

FROM depbase AS installer
WORKDIR /root
RUN yarn workspaces focus server --production

FROM depbase AS runner
WORKDIR /tmp
RUN apt-get update && apt-get install -y ca-certificates wget
RUN wget https://github.com/bbc/audiowaveform/releases/download/1.8.1/audiowaveform_1.8.1-1-12_amd64.deb
RUN apt-get update && dpkg --force-all -i audiowaveform_1.8.1-1-12_amd64.deb && apt-get -f install -y
RUN rm audiowaveform_1.8.1-1-12_amd64.deb

WORKDIR /root

COPY --from=installer --chown=node:node /root/.yarn ./.yarn
COPY --from=installer --chown=node:node /root/.pnp.cjs ./.pnp.cjs
COPY --from=installer --chown=node:node /root/.pnp.loader.mjs ./.pnp.loader.mjs
COPY --from=builder --chown=node:node /root/packages/common/dist ./packages/common/dist
COPY --from=builder --chown=node:node /root/packages/server/build ./packages/server/build
COPY --chown=node:node ./partials partials

COPY --from=mwader/static-ffmpeg:latest /ffprobe /usr/local/bin/

RUN chown -R node:node /root

USER node

CMD ["yarn", "node", "packages/server/build/app.js"]