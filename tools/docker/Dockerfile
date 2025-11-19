# BLEULIONTREASURY™ Mirror Agent Docker Image
# 
# Provenance: 2025-11-19T17:57:01Z
# Author: Bleu (4way4eva)
# Base: Node.js 18 Alpine

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for ethers and node-fetch
# Copy package.json if it exists, otherwise create minimal one
COPY package*.json ./

# If package.json doesn't exist in tools/mirror/, create it
RUN if [ ! -f package.json ]; then \
      echo '{"name":"bleulion-mirror-agent","version":"1.0.0","main":"mirror_to_codex.js","dependencies":{"ethers":"^5.7.2","node-fetch":"^2.6.7","dotenv":"^16.3.1"}}' > package.json; \
    fi

# Install dependencies
RUN npm install --production

# Copy mirror agent script
COPY mirror_to_codex.js .

# Create .env placeholder (will be overridden by docker-compose or runtime)
RUN echo "# Environment variables - set these via docker-compose or -e flags" > .env.example && \
    echo "ETH_PROVIDER=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY" >> .env.example && \
    echo "CODEX_ENDPOINT=https://codex.evolvverse.io/api/v1/records" >> .env.example && \
    echo "MIRROR_SIGNER_PRIVATE_KEY=0x..." >> .env.example && \
    echo "PRIMARY_VAULT=0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be" >> .env.example && \
    echo "POLL_INTERVAL=15000" >> .env.example

# Set environment defaults (can be overridden)
ENV NODE_ENV=production
ENV POLL_INTERVAL=15000

# Health check - verify node can start
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# No ports exposed - background worker

# Start the mirror agent
CMD ["node", "mirror_to_codex.js"]
