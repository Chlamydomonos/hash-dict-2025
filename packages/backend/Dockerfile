# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project using the release script
RUN pnpm release

# Stage 2: Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Copy backend dist files
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Copy common-lib dist files
COPY --from=builder /app/packages/common-lib/dist ./packages/common-lib/dist

# Copy backend package.json (for dependencies info)
COPY --from=builder /app/packages/backend/package.json ./packages/backend/

# Copy common-lib package.json
COPY --from=builder /app/packages/common-lib/package.json ./packages/common-lib/

# Copy root package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "packages/backend/dist/main.js"]
