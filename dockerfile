# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Standalone output already includes only what's needed
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]