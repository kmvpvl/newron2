FROM node:alpine
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
COPY . .
RUN npm i
RUN npm run build
RUN chown -R node /usr/src/server
USER node
EXPOSE ${PORT}
CMD ["npm", "run", "start"]