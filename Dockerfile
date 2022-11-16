# STAGE 1
FROM node:18-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY ./prisma prisma
COPY package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
RUN npx prisma generate
COPY --chown=node:node . .
RUN npm run tsc

# STAGE 2
FROM node:18-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules/.prisma ./node_modules/.prisma

CMD [ "node", "dist/index.js"]