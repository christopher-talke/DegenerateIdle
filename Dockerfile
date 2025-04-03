# STAGE 1
FROM node:18 as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY prisma prisma
COPY package*.json ./
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
RUN npx prisma generate
COPY --chown=node:node . .
RUN npm run tsc

# STAGE 2
FROM node:18
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install --production
ENV TZ="Australia/Sydney"
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/prisma ./prisma
COPY --from=builder /home/node/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /home/node/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /home/node/app/start.sh ./start.sh
RUN chmod +x /home/node/app/start.sh

CMD [ "/home/node/app/start.sh" ]