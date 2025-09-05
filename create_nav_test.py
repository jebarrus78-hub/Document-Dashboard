#!/usr/bin/env python3
"""
Create a direct navigation test for BFT sections.
"""

def create_navigation_test():
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BFT Navigation Test</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .nav-test {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .nav-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .nav-card:hover {
            background: #f8f9fa;
            border-color: #007bff;
        }
        .nav-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .nav-card p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .status {
            font-weight: bold;
        }
        .status.success { color: #28a745; }
        .status.warning { color: #ffc107; }
        .status.error { color: #dc3545; }
        #content-display {
            margin-top: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            min-height: 200px;
        }
    </style>
</head>
<body>
    <h1>🧭 BFT Navigation Test</h1>
    <p>Click on any business line below to test BFT navigation:</p>
    
    <div class="nav-test" id="nav-test"></div>
    
    <div id="content-display">
        <p>Select a business line above to display its BFT section...</p>
    </div>
    
    <script src="script-toc.js"></script>
    <script>
        let tracker = null;
        
        async function initializeTest() {
            try {
                // Load the BCP data
                const response = await fetch('bcp-data-final.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Create tracker instance
                tracker = new BCPTrackerTOC();
                await tracker.loadBCPData();
                
                const navTest = document.getElementById('nav-test');
                const bcpPlans = data.bcpPlans;
                
                // Create navigation cards
                for (const [lineId, plan] of Object.entries(bcpPlans)) {
                    const card = document.createElement('div');
                    card.className = 'nav-card';
                    
                    // Check BFT status
                    let status = 'error';
                    let statusText = 'No BFT section';
                    let contactCount = 0;
                    
                    const sections = plan.sections || {};
                    for (const [sectionId, section] of Object.entries(sections)) {
                        if (sectionId.includes('business_function_team')) {
                            status = 'warning';
                            statusText = 'BFT section found';
                            
                            const content = section.content || [];
                            for (const item of content) {
                                if (item.type === 'contacts' && item.title === 'Business Function Team Members') {
                                    const contacts = item.content || [];
                                    contactCount = contacts.filter(c => c.type === 'team_member').length;
                                    if (contactCount > 0) {
                                        status = 'success';
                                        statusText = `${contactCount} BFT contacts`;
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    
                    card.innerHTML = `
                        <h3>${plan.title}</h3>
                        <p><strong>ID:</strong> ${lineId}</p>
                        <p class="status ${status}">${statusText}</p>
                    `;
                    
                    card.addEventListener('click', () => testBFTNavigation(lineId, plan.title));
                    navTest.appendChild(card);
                }
                
            } catch (error) {
                console.error('Initialization error:', error);
                document.getElementById('nav-test').innerHTML = `
                    <div style="color: red; padding: 20px;">
                        Error loading data: ${error.message}
                    </div>
                `;
            }
        }
        
        function testBFTNavigation(lineId, planTitle) {
            const contentDisplay = document.getElementById('content-display');
            
            try {
                // Set current line
                tracker.currentLine = lineId;
                
                // Find BFT section
                const plan = tracker.bcpData[lineId];
                const sections = plan.sections || {};
                
                let bftSectionId = null;
                for (const sectionId of Object.keys(sections)) {
                    if (sectionId.includes('business_function_team')) {
                        bftSectionId = sectionId;
                        break;
                    }
                }
                
                if (!bftSectionId) {
                    contentDisplay.innerHTML = `
                        <h2>${planTitle} - BFT Section</h2>
                        <p style="color: orange;">⚠️ No BFT section found in this business line.</p>
                        <p>This is expected for the LSC business line.</p>
                    `;
                    return;
                }
                
                // Set current section and display
                tracker.currentSection = bftSectionId;
                const sectionHtml = tracker.renderSectionContent(sections[bftSectionId]);
                
                contentDisplay.innerHTML = `
                    <h2>${planTitle} - BFT Section</h2>
                    ${sectionHtml}
                `;
                
            } catch (error) {
                console.error('Navigation error:', error);
                contentDisplay.innerHTML = `
                    <h2>${planTitle} - BFT Section</h2>
                    <p style="color: red;">❌ Error displaying BFT section: ${error.message}</p>
                `;
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeTest);
    </script>
</body>
</html>'''
    
    with open('test_bft_navigation.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Created test_bft_navigation.html")
    print("🌐 Open this file in a browser to test BFT navigation across all business lines")

if __name__ == "__main__":
    create_navigation_test()
