FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies required to compile better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files and Svelte config first so svelte-kit sync succeeds during npm ci
COPY package*.json svelte.config.js ./
RUN npm ci

# Copy the rest of the application and build
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app

# Copy built output, production dependencies, and package.json
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD [ "node", "build" ]