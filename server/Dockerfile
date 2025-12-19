FROM --platform=$TARGETPLATFORM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]
