FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . ./

EXPOSE 4001

CMD ["pnpm", "dev"]