# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Next.js build output
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Optional: copy next config if you have one
COPY --from=build /app/next.config.js ./next.config.js

# Copy env (or rely on docker-compose env_file)
COPY .env .env

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]