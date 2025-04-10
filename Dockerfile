# Use the official Node.js 20 LTS image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first for dependency caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# --- Development Stage ---
FROM base AS development

WORKDIR /app

# Expose the Vite development server port
EXPOSE 5173

# Command to run the development server
CMD ["pnpm", "run", "dev"]

# --- Build Stage ---
FROM base AS build

WORKDIR /app

# Command to build the production script
RUN pnpm run build

# This stage doesn't run anything, it just contains the build artifacts in /app/dist 