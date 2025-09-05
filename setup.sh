#!/bin/bash
# BCP Data Tracker Setup Script
# Updated for Python 3.13 support

echo "🚀 Setting up BCP Data Tracker with Python 3.13..."

# Check if Python 3.13 is available, fallback to python3
PYTHON_CMD="python3"
if command -v python3.13 &> /dev/null; then
    PYTHON_CMD="python3.13"
    echo "✅ Found Python 3.13"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    echo "✅ Found Python $PYTHON_VERSION"
    if [[ $PYTHON_VERSION == 3.13.* ]]; then
        echo "✅ Python 3.13 confirmed"
    else
        echo "⚠️  Using Python $PYTHON_VERSION (recommended: 3.13)"
    fi
else
    echo "❌ Python 3 is required but not installed. Please install Python 3.13."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "🔧 Creating Python 3.13 virtual environment..."
    $PYTHON_CMD -m venv .venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source .venv/bin/activate

# Install/upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install required Python packages
echo "📦 Installing Python dependencies from requirements.txt..."
pip install -r requirements.txt

# Start the web server
echo "🌐 Starting web server on http://localhost:8000"
echo "📂 Make sure your .docx files are in this directory"
echo "🔄 Run 'python document_converter_final.py' to convert Word documents to JSON"
echo "🧪 Run 'python verify_bft_status.py' to verify BFT data integrity"
echo ""
echo "📋 Available URLs:"
echo "   • Main App: http://localhost:8000/index.html"
echo "   • Diagnostic: http://localhost:8000/diagnostic.html"
echo "   • Simple Version: http://localhost:8000/index_simple.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python -m http.server 8000
