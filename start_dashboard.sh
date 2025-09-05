#!/bin/bash

# BCP Document Dashboard Startup Script
# Python 3.13 Compatible

echo "🚀 Starting BCP Document Dashboard"
echo "=================================="

# Check Python version
python_version=$("$VIRTUAL_ENV/bin/python" --version 2>&1)
echo "Python version: $python_version"

# Check if we're in virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment active: $VIRTUAL_ENV"
else
    echo "⚠️  No virtual environment detected"
    echo "Please activate your Python 3.13 virtual environment first:"
    echo "source .venv/bin/activate"
    exit 1
fi

# Check for required files
echo ""
echo "Checking for .docx files..."
docx_count=$(find . -maxdepth 1 -name "*.docx" ! -name "~*" | wc -l)
echo "Found $docx_count .docx files in current directory"

if [ $docx_count -eq 0 ]; then
    echo "⚠️  No .docx files found in current directory"
    echo "Please add some .docx files to test the application"
fi

# Install dependencies if needed
echo ""
echo "Checking dependencies..."
"$VIRTUAL_ENV/bin/pip" install -q -r requirements_flask.txt

# Start Flask server
echo ""
echo "🌐 Starting Flask server..."
echo "Dashboard will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

export FLASK_APP=app.py
export FLASK_ENV=development
"$VIRTUAL_ENV/bin/python" app.py
