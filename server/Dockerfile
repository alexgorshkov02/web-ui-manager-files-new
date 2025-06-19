# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (to take advantage of layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose server port (adjust if needed)
EXPOSE 3001

# Run the server
CMD ["node", "index.js"]