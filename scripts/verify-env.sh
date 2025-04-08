#!/bin/bash

# Exit on error
set -e

echo "🔍 Verifying local environment matches CI..."

# Check required directories
echo "📁 Checking directory structure..."
required_dirs=("project-briefs/test" "coverage" "local-issues")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Missing directory: $dir"
        exit 1
    fi
    echo "✅ Found directory: $dir"
done

# Check test files
echo "📄 Checking test files..."
if [ ! -f "project-briefs/test/test-bot.json" ]; then
    echo "❌ Missing test file: project-briefs/test/test-bot.json"
    exit 1
fi
echo "✅ Found test file: project-briefs/test/test-bot.json"

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run create-issues script
echo "📝 Running create-issues script..."
pnpm run create-issues

# Verify outputs
echo "🔍 Verifying outputs..."
if [ ! -d "local-issues/test-bot" ]; then
    echo "❌ Missing output directory: local-issues/test-bot"
    exit 1
fi
echo "✅ Found output directory: local-issues/test-bot"

# Check coverage
echo "📊 Checking coverage..."
if [ ! -f "coverage/lcov.info" ]; then
    echo "❌ Missing coverage report"
    exit 1
fi
echo "✅ Found coverage report"

echo "✨ Local environment verification complete!" 