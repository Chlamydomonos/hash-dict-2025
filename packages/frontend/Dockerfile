# Stage 1: Build stage
FROM node:22-alpine AS builder

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

# Stage 2: Production stage with nginx
FROM nginx:alpine AS production

# Copy built frontend files
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
