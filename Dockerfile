FROM node:14
WORKDIR /usr/src/map
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 10001
CMD [ "npm" , "run", "watch"]