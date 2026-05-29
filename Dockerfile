FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --omit=dev || npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of application
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Expose port
EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
