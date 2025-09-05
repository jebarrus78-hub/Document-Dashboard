// Simple navigation script for debugging
console.log('Simple nav script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in simple nav script');
    
    // Check if elements exist
    const welcome = document.getElementById('welcome');
    const bcpContent = document.getElementById('bcp-content');
    const sectionContent = document.getElementById('section-content');
    const backBtn = document.getElementById('back-btn');
    const sectionBackBtn = document.getElementById('section-back-btn');
    const businessBtns = document.querySelectorAll('.business-line-btn');
    
    console.log('Elements found:');
    console.log('- welcome:', !!welcome);
    console.log('- bcp-content:', !!bcpContent);
    console.log('- section-content:', !!sectionContent);
    console.log('- back-btn:', !!backBtn);
    console.log('- section-back-btn:', !!sectionBackBtn);
    console.log('- business line buttons:', businessBtns.length);
    
    // Simple state management
    let currentLine = null;
    
    function showWelcome() {
        console.log('Showing welcome');
        if (welcome) welcome.classList.remove('hidden');
        if (bcpContent) bcpContent.classList.add('hidden');
        if (sectionContent) sectionContent.classList.add('hidden');
        currentLine = null;
    }
    
    function showBCP(line) {
        console.log('Showing BCP for:', line);
        currentLine = line;
        if (welcome) welcome.classList.add('hidden');
        if (bcpContent) bcpContent.classList.remove('hidden');
        if (sectionContent) sectionContent.classList.add('hidden');
        
        // Update title
        const title = document.getElementById('bcp-title');
        if (title) title.textContent = `${line.toUpperCase()} Business Continuity Plan`;
    }
    
    function showSection() {
        console.log('Showing section');
        if (welcome) welcome.classList.add('hidden');
        if (bcpContent) bcpContent.classList.add('hidden');
        if (sectionContent) sectionContent.classList.remove('hidden');
    }
    
    // Add event listeners
    if (backBtn) {
        console.log('Adding back button listener');
        backBtn.addEventListener('click', function(e) {
            console.log('BACK BUTTON CLICKED!');
            e.preventDefault();
            e.stopPropagation();
            showWelcome();
        });
        
        // Also try onclick as backup
        backBtn.onclick = function(e) {
            console.log('BACK BUTTON ONCLICK!');
            e.preventDefault();
            e.stopPropagation();
            showWelcome();
        };
    } else {
        console.error('Back button not found!');
    }
    
    if (sectionBackBtn) {
        console.log('Adding section back button listener');
        sectionBackBtn.addEventListener('click', function(e) {
            console.log('SECTION BACK BUTTON CLICKED!');
            e.preventDefault();
            e.stopPropagation();
            if (currentLine) {
                showBCP(currentLine);
            } else {
                showWelcome();
            }
        });
        
        // Also try onclick as backup
        sectionBackBtn.onclick = function(e) {
            console.log('SECTION BACK BUTTON ONCLICK!');
            e.preventDefault();
            e.stopPropagation();
            if (currentLine) {
                showBCP(currentLine);
            } else {
                showWelcome();
            }
        };
    } else {
        console.error('Section back button not found!');
    }
    
    // Add business line button listeners
    businessBtns.forEach(function(btn) {
        const line = btn.getAttribute('data-line');
        console.log('Adding listener for business line:', line);
        btn.addEventListener('click', function(e) {
            console.log('Business line clicked:', line);
            e.preventDefault();
            e.stopPropagation();
            showBCP(line);
        });
    });
    
    console.log('Simple navigation setup complete');
});

console.log('Simple nav script setup complete');
