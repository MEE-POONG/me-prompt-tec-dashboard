# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for node-gyp
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on lockfile
RUN npm install --ignore-scripts

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments
ARG DATABASE_URL=mongodb://dummy:27017/dummy
ARG BUILD_ID=local
ARG COMMIT_SHA=unknown
ARG BUILD_TIME=unknown

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_BUILD_ID=${BUILD_ID}
ENV NEXT_PUBLIC_COMMIT_SHA=${COMMIT_SHA}
ENV NEXT_PUBLIC_BUILD_TIME=${BUILD_TIME}

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    npm run build; \
  fi

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
