FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Create test directory and files
RUN mkdir -p project-briefs/test && \
    echo '{"projectName":"Test Bot","projectKey":"test-bot","projectDescription":"A test bot","targetAudience":"Test users","keyFeatures":"Test features","technicalRequirements":"Test requirements","timeline":"1 week","budget":"$1000","additionalNotes":"Test notes"}' > project-briefs/test/test-bot.json

# Build the application
RUN pnpm build

# Run full test workflow
CMD ["sh", "-c", "pnpm test && pnpm run create-issues"] 