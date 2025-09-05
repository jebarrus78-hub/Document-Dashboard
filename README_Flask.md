# BCP Document Dashboard - Flask Version

A web-based dashboard application for browsing and viewing Business Continuity Plan (BCP) documents stored as .docx files.

## Features

- **🗂️ Automatic Document Discovery**: Automatically detects all .docx files in the current folder
- **📋 Dynamic Table of Contents**: Generates hierarchical TOC based on document heading styles
- **📖 Section-by-Section Viewing**: Click any TOC entry to view just that section's content
- **📊 Table Support**: Properly extracts and displays tables from documents as HTML
- **↩️ Return to Initial State**: Easy navigation back to the main view
- **🔄 Real-time Updates**: Automatically refreshes when documents change

## Requirements

- **Python 3.13** (specifically required)
- Flask 3.0+
- python-docx 1.1+

## Quick Start

### 1. Setup Python Environment

```bash
# Create and activate virtual environment
python3.13 -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or .venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements_flask.txt
```

### 3. Add .docx Files

Place your .docx files in the same directory as the application. The dashboard will automatically detect all .docx files in the current folder.

### 4. Start the Dashboard

```bash
# Method 1: Using the startup script
./start_dashboard.sh

# Method 2: Direct Python execution
python app.py
```

The dashboard will be available at: **http://localhost:5001**

## Usage

1. **Browse Documents**: The left panel shows all available .docx files
2. **Expand TOC**: Click on any document name to show its Table of Contents
3. **View Sections**: Click on any section in the TOC to view its content
4. **Return to Start**: Use the "← Return to Initial State" button to go back
5. **Navigate**: Content includes properly formatted text, lists, and tables

## How It Works

### Backend (Flask + python-docx)

- **Document Processing**: Uses `python-docx` library to parse .docx files
- **TOC Generation**: Analyzes document heading styles (Heading 1, Heading 2, etc.)
- **Content Extraction**: Extracts paragraphs, lists, and tables for each section
- **Table Processing**: Converts document tables to HTML format
- **API Endpoints**:
  - `/api/documents` - List all documents with TOCs
  - `/api/document/<filename>/<section_id>` - Get specific section content
  - `/api/document/<filename>/full` - Get full document content

### Frontend (HTML/CSS/JavaScript)

- **Responsive Design**: Works on desktop and mobile devices
- **Dynamic Loading**: Fetches content asynchronously via JavaScript
- **Interactive TOC**: Collapsible/expandable document navigation
- **Clean UI**: Modern, professional interface

## Document Structure Processing

The application recognizes standard document structures:

### Headings
- **Heading 1**: Main sections (e.g., "SECTION I: Introduction")
- **Heading 2**: Subsections (e.g., "Objective", "Scope")
- **Heading 3**: Sub-subsections

### Content Types
- **Paragraphs**: Regular text content
- **Tables**: Contact lists, procedures, data tables
- **Lists**: Bullet points, numbered lists

### Example Document Structure
```
SECTION I: Introduction to the Business Continuity Plan (BCP)    [Heading 1]
    Objective                                                     [Heading 2]
    Scope                                                         [Heading 2]
    How to use the BCP                                           [Heading 2]
SECTION II: Quick Activation and Engagement Guide               [Heading 1]
    When to Activate the BCP                                     [Heading 2]
SECTION III: Recovery Teams                                      [Heading 1]
    Business Function Team (BFT)                                 [Heading 2]
        [TABLE: Contact Information]
    Cross-Functional Team (CFT)                                  [Heading 2]
        [TABLE: Contact Information]
```

## File Structure

```
BCP Data Tracker/
├── app.py                      # Flask backend application
├── requirements_flask.txt      # Python dependencies
├── start_dashboard.sh          # Startup script
├── templates/
│   └── index.html             # Main dashboard template
├── static/
│   ├── dashboard.css          # Styling
│   └── dashboard.js           # Frontend logic
├── *.docx                     # Your BCP documents (auto-detected)
└── README_Flask.md            # This file
```

## Configuration

### Documents Folder
By default, the application looks for .docx files in the same directory. To change this, modify the `DOCUMENTS_FOLDER` variable in `app.py`:

```python
DOCUMENTS_FOLDER = '/path/to/your/documents'
```

### Port Configuration
The application runs on port 5001 by default. To change this, modify the last line in `app.py`:

```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

## Troubleshooting

### No Documents Found
- Ensure .docx files are in the correct directory
- Check that files are not temporary files (don't start with `~`)
- Verify file permissions

### Import Errors
- Ensure you're using Python 3.13
- Install dependencies: `pip install -r requirements_flask.txt`
- Activate virtual environment before running

### Port Issues
- If port 5001 is in use, change the port in `app.py`
- On macOS, disable AirPlay Receiver if using port 5000

### Document Parsing Issues
- Ensure documents are valid .docx files (not .doc)
- Check that documents have proper heading styles
- Large documents may take longer to process

## Development

### Adding New Features

1. **Backend**: Modify `DocumentProcessor` class in `app.py`
2. **Frontend**: Update `static/dashboard.js` and `static/dashboard.css`
3. **API**: Add new routes in `app.py`

### Testing

```bash
# Start in debug mode (default)
python app.py

# Check document parsing
python -c "from app import doc_processor; print(doc_processor.get_document_list())"
```

## Comparison with Previous Version

### Advantages of Flask Version
- ✅ **Dynamic**: Reads documents in real-time, no pre-processing needed
- ✅ **Flexible**: Easy to add new documents without rebuilding
- ✅ **Accurate**: Direct .docx parsing preserves document structure
- ✅ **Maintainable**: Clean separation between backend and frontend
- ✅ **Extensible**: Easy to add new features and document types

### Previous JSON Version
- Static pre-processed data
- Required manual data extraction
- Less flexible for document changes
- No real-time updates

## Next Steps

1. **Test with your documents**: Add your .docx files and start the dashboard
2. **Customize styling**: Modify `static/dashboard.css` for your branding
3. **Add features**: Extend the `DocumentProcessor` class for additional functionality
4. **Deploy**: Use a production WSGI server for deployment

## Support

- Check the Flask server logs for debugging information
- Ensure Python 3.13 compatibility
- Verify document structure and heading styles
- Review browser console for frontend errors
