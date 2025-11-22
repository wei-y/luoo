#!/bin/bash

# Exit on error
set -e

echo "Starting local CI verification..."

# 1. Backup existing data
if [ -e "data" ]; then
    echo "Backing up existing data..."
    mv data data.bak
fi

# Ensure cleanup happens even if tests fail
cleanup() {
    echo "Cleaning up..."
    rm -rf data
    if [ -e "data.bak" ]; then
        echo "Restoring original data..."
        mv data.bak data
    fi
}
trap cleanup EXIT

# 2. Setup Test Data
echo "Setting up test data..."
mkdir -p data
cp -r test-data/* data/

# 3. Run Tests
echo "Running Playwright tests..."
npx playwright test

echo "Verification complete!"
