FROM node:16

# Create app directory
WORKDIR /src

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8000

CMD [ "node", "server.js" ]





