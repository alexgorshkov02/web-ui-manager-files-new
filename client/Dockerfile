FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build the app (uses .env at build time!)
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port 80
EXPOSE 80

# Serve build directory
CMD ["serve", "-s", "build", "-l", "80"]