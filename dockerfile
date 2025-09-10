FROM node:20-alpine

WORKDIR /usr/src/app

# Copiamos primero package.json y package-lock.json
COPY package*.json ./

# Copiamos también el schema de Prisma antes de instalar dependencias
COPY prisma ./prisma

# Instalamos dependencias (esto ejecutará prisma generate en postinstall y ya encontrará el schema)
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos NestJS
RUN npm run build

CMD ["npm", "run", "start:dev"]
