FROM python:3.6-alpine

# Argument from docker-compose
ARG DEPLOY_ENV
ARG GAME_ID

# Create app directory
WORKDIR /usr/src/app

# Install dependency tools
RUN apk update && \
  apk add nodejs npm && \
  pip install goprocam

# Copy all files
COPY docker/docker-container-init.sh /usr/local/bin
COPY docker/package.json .
COPY server/scripts server/scripts
COPY server/services server/services
COPY dist/$DEPLOY_ENV/games/$GAME_ID dist

RUN \
  sed -i "s/<=%/<%/g" dist/views/qrcode.ejs && \
  sed -i "s/%=>/%>/g" dist/views/qrcode.ejs && \
  \
  npm config set unsafe-perm true && \
  npm install -g cnpm --registry=https://registry.npm.taobao.org && \
  cnpm install --production

EXPOSE $DEPLOY_PORT

CMD [ "node", "server/services/index.js"]
#CMD [ "sh", "/usr/local/bin/docker-container-init.sh"]
