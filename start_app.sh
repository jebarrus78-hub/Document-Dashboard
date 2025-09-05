#!/bin/bash

# BCP Document Dashboard - Quick Start Script
# Makes the app completely standalone and portable

set -e  # Exit on any error

echo "🏥 BCP Document Dashboard - Quick Start"
echo "======================================"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

# Run the standalone runner
echo "🚀 Starting application..."
python3 run_standalone.py "$@"
