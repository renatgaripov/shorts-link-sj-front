# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock scripts ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV NUXT_HOST=0.0.0.0

# Start the application
CMD ["node", ".output/server/index.mjs"]

