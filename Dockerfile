FROM node:6
ADD . /src
WORKDIR /src
RUN npm install
CMD ["node","server.js"]
EXPOSE 3000
