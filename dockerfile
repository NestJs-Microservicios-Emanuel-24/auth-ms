FROM node:21-alpine3.19

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .
#los comando se hicieron ya en la llamada npm run start dev (package json) para que la bd exista desde antes que se corre el proyecto
#RUN npx prisma migrate dev
#RUN npx prisma generate


EXPOSE 3004