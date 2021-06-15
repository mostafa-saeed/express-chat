FROM node:12-alpine

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app

USER node

COPY --chown=node:node package*.json ./
RUN npm install --no-optional && npm cache clean --force

COPY --chown=node:node . .

CMD ["node", "src/app.js"]
