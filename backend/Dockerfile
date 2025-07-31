FROM node:20-alpine

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy server and static files
COPY server.js ./
COPY public ./public

# App port
ENV PORT=8000
EXPOSE 8000

# (Optional) healthcheck used by HAProxy/docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["node", "server.js"]
