FROM node:14-alpine

USER node

WORKDIR /app/src

CMD [ "yarn", "dev" ]
