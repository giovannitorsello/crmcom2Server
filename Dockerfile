FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 18088:18088
EXPOSE 8443:18443
EXPOSE 7502:7502

CMD [ "node", "main.js" ]


