// BCP Data Tracker Application - Dynamic Version
class BCPTracker {
    constructor() {
        this.currentLine = null;
        this.currentSection = null;
        this.bcpData = {};
        this.indexData = null;
        this.searchResults = [];
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Load the data index
            await this.loadIndexData();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Update business line stats
            this.updateDashboardStats();
            
            console.log('BCP Tracker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BCP Tracker:', error);
            this.showError('Failed to load BCP data. Please ensure documents have been converted.');
        }
    }

    async loadIndexData() {
        try {
            const response = await fetch('./data/index.json');
            if (!response.ok) {
                throw new Error('Index file not found');
            }
            this.indexData = await response.json();
            console.log('Index data loaded:', this.indexData);
        } catch (error) {
            console.error('Error loading index data:', error);
            throw error;
        }
    }

    async loadBCPData(businessLine) {
        if (this.bcpData[businessLine]) {
            return this.bcpData[businessLine];
        }

        try {
            const response = await fetch(`./data/${businessLine}.json`);
            if (!response.ok) {
                throw new Error(`Data file for ${businessLine} not found`);
            }
            
            const data = await response.json();
            this.bcpData[businessLine] = data;
            console.log(`Loaded data for ${businessLine}:`, data);
            return data;
        } catch (error) {
            console.error(`Error loading BCP data for ${businessLine}:`, error);
            throw error;
        }
    }

    initializeEventListeners() {
        // Business line buttons
        document.querySelectorAll('.business-line-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const line = e.target.getAttribute('data-line');
                this.showBCPDetails(line);
            });
        });

        // Section buttons
        document.querySelectorAll('.section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSectionDetails(section);
            });
        });

        // Back buttons
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        document.getElementById('section-back-btn').addEventListener('click', () => {
            this.showBCPDetails(this.currentLine);
        });

        document.getElementById('search-back-btn').addEventListener('click', () => {
            this.hideSearchResults();
        });

        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => {
            this.performSearch();
        });

        document.getElementById('clear-search-btn').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Filter change handlers
        document.getElementById('business-line-filter').addEventListener('change', () => {
            if (this.searchResults.length > 0) {
                this.performSearch();
            }
        });

        document.getElementById('section-filter').addEventListener('change', () => {
            if (this.searchResults.length > 0) {
                this.performSearch();
            }
        });
    }

    updateDashboardStats() {
        if (!this.indexData) return;

        const businessCount = Object.keys(this.indexData.documents).length;
        const statCards = document.querySelectorAll('.stat-card');
        
        if (statCards[0]) {
            statCards[0].querySelector('h3').textContent = businessCount;
        }
        
        // Update last updated info
        const lastUpdated = new Date(this.indexData.last_updated).toLocaleDateString();
        if (statCards[1]) {
            statCards[1].querySelector('h3').textContent = 'Updated';
            statCards[1].querySelector('p').textContent = lastUpdated;
        }
    }

    showWelcomeScreen() {
        document.getElementById('welcome').classList.remove('hidden');
        document.getElementById('bcp-content').classList.add('hidden');
        document.getElementById('section-content').classList.add('hidden');
        this.hideSearchResults();
        
        // Clear active states
        document.querySelectorAll('.business-line-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.currentLine = null;
        this.currentSection = null;
    }

    async showBCPDetails(line) {
        try {
            this.currentLine = line;
            
            // Load BCP data
            const bcpData = await this.loadBCPData(line);
            
            // Update UI
            document.getElementById('welcome').classList.add('hidden');
            document.getElementById('bcp-content').classList.remove('hidden');
            document.getElementById('section-content').classList.add('hidden');
            this.hideSearchResults();
            
            // Update title
            const title = bcpData.metadata.filename.replace('.docx', '');
            document.getElementById('bcp-title').textContent = title;
            
            // Update section buttons with actual data counts
            this.updateSectionButtons(bcpData);
            
            // Update active state
            document.querySelectorAll('.business-line-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-line="${line}"]`).classList.add('active');
            
        } catch (error) {
            console.error('Error showing BCP details:', error);
            this.showError(`Failed to load data for ${line}`);
        }
    }

    updateSectionButtons(bcpData) {
        const sections = bcpData.sections;
        
        document.querySelectorAll('.section-btn').forEach(btn => {
            const sectionType = btn.getAttribute('data-section');
            const sectionData = sections[sectionType] || [];
            const count = sectionData.length;
            
            // Update description with count
            const description = btn.querySelector('p');
            const originalText = description.textContent.split(' (')[0]; // Remove existing count
            description.textContent = `${originalText} (${count} items)`;
        });
    }

    async showSectionDetails(section) {
        if (!this.currentLine) {
            console.error('No current line selected');
            return;
        }

        try {
            this.currentSection = section;
            const bcpData = await this.loadBCPData(this.currentLine);
            const sectionData = bcpData.sections[section] || [];
            
            // Update UI
            document.getElementById('bcp-content').classList.add('hidden');
            document.getElementById('section-content').classList.remove('hidden');
            this.hideSearchResults();
            
            // Update content
            const sectionTitles = {
                'contacts': 'Emergency Contacts',
                'procedures': 'Emergency Procedures',
                'resources': 'Critical Resources',
                'recovery': 'Recovery Strategies',
                'communication': 'Communication Plan',
                'testing': 'Testing & Maintenance'
            };
            
            document.getElementById('section-title').textContent = sectionTitles[section];
            document.getElementById('section-body').innerHTML = this.formatSectionContent(sectionData, section);
            
        } catch (error) {
            console.error('Error showing section details:', error);
            this.showError(`Failed to load ${section} section`);
        }
    }

    formatSectionContent(sectionData, sectionType) {
        if (!sectionData || sectionData.length === 0) {
            return `<p>No ${sectionType} information found in this document.</p>`;
        }

        let html = '';
        
        sectionData.forEach((item, index) => {
            if (item.type === 'table' && item.formatted) {
                html += this.formatTableContent(item.formatted, sectionType);
            } else if (item.type === 'paragraph') {
                html += this.formatParagraphContent(item, sectionType);
            } else if (item.type === 'table') {
                html += this.formatRawTableContent(item.content);
            }
        });
        
        return html || `<p>Content available but formatting not yet supported for this section type.</p>`;
    }

    formatTableContent(tableData, sectionType) {
        if (sectionType === 'contacts') {
            return this.formatContactsTable(tableData);
        } else if (sectionType === 'procedures') {
            return this.formatProceduresTable(tableData);
        } else {
            return this.formatGenericTable(tableData);
        }
    }

    formatContactsTable(contacts) {
        let html = '<div class="contacts-grid">';
        
        contacts.forEach(contact => {
            html += '<div class="contact-card">';
            
            Object.entries(contact).forEach(([key, value]) => {
                if (value && value.trim()) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    html += `<div class="contact-field">`;
                    html += `<strong>${label}:</strong> ${value}`;
                    html += `</div>`;
                }
            });
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    formatProceduresTable(procedures) {
        let html = '<div class="procedures-list">';
        
        procedures.forEach((procedure, index) => {
            html += '<div class="procedure-step">';
            html += `<h4>Step ${index + 1}</h4>`;
            
            Object.entries(procedure).forEach(([key, value]) => {
                if (value && value.trim()) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    html += `<p><strong>${label}:</strong> ${value}</p>`;
                }
            });
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    formatParagraphContent(item, sectionType) {
        const className = item.is_heading ? 'section-heading' : 'section-paragraph';
        return `<div class="${className}"><p>${item.content}</p></div>`;
    }

    formatRawTableContent(tableContent) {
        if (!tableContent || tableContent.length === 0) return '';
        
        let html = '<table class="data-table">';
        
        tableContent.forEach((row, rowIndex) => {
            const tag = rowIndex === 0 ? 'th' : 'td';
            html += '<tr>';
            row.forEach(cell => {
                html += `<${tag}>${cell}</${tag}>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        return html;
    }

    formatGenericTable(tableData) {
        if (!Array.isArray(tableData)) return '';
        
        let html = '<div class="generic-table-content">';
        
        tableData.forEach(item => {
            html += '<div class="table-item">';
            Object.entries(item).forEach(([key, value]) => {
                if (value && value.trim()) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    html += `<p><strong>${label}:</strong> ${value}</p>`;
                }
            });
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    async performSearch() {
        const searchTerm = document.getElementById('search-input').value.trim();
        const businessLineFilter = document.getElementById('business-line-filter').value;
        const sectionFilter = document.getElementById('section-filter').value;
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }

        try {
            // Show loading state
            this.showSearchLoading();
            
            // Get business lines to search
            const businessLines = businessLineFilter ? [businessLineFilter] : Object.keys(this.indexData.documents);
            
            // Perform search across selected business lines
            this.searchResults = [];
            
            for (const line of businessLines) {
                const results = await this.searchInBusinessLine(line, searchTerm, sectionFilter);
                this.searchResults.push(...results);
            }
            
            // Display results
            this.displaySearchResults(searchTerm, businessLineFilter, sectionFilter);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        }
    }

    async searchInBusinessLine(businessLine, searchTerm, sectionFilter) {
        const bcpData = await this.loadBCPData(businessLine);
        const results = [];
        const searchTermLower = searchTerm.toLowerCase();
        
        // Get sections to search
        const sectionsToSearch = sectionFilter ? [sectionFilter] : Object.keys(bcpData.sections);
        
        sectionsToSearch.forEach(sectionType => {
            const sectionData = bcpData.sections[sectionType] || [];
            
            sectionData.forEach((item, index) => {
                let content = '';
                let matchFound = false;
                
                if (item.type === 'paragraph') {
                    content = item.content;
                    matchFound = content.toLowerCase().includes(searchTermLower);
                } else if (item.type === 'table') {
                    if (item.formatted && Array.isArray(item.formatted)) {
                        content = JSON.stringify(item.formatted);
                        matchFound = content.toLowerCase().includes(searchTermLower);
                    } else if (item.content) {
                        content = JSON.stringify(item.content);
                        matchFound = content.toLowerCase().includes(searchTermLower);
                    }
                }
                
                if (matchFound) {
                    results.push({
                        businessLine,
                        businessLineTitle: bcpData.metadata.filename.replace('.docx', ''),
                        sectionType,
                        content: this.truncateContent(content, searchTerm, 200),
                        index,
                        item
                    });
                }
            });
        });
        
        return results;
    }

    truncateContent(content, searchTerm, maxLength) {
        const searchIndex = content.toLowerCase().indexOf(searchTerm.toLowerCase());
        
        if (searchIndex === -1) return content.substring(0, maxLength) + '...';
        
        const start = Math.max(0, searchIndex - 50);
        const end = Math.min(content.length, searchIndex + searchTerm.length + 150);
        
        let result = content.substring(start, end);
        
        if (start > 0) result = '...' + result;
        if (end < content.length) result = result + '...';
        
        return result;
    }

    showSearchLoading() {
        document.getElementById('search-results-content').innerHTML = '<p>Searching...</p>';
        this.showSearchResults();
    }

    displaySearchResults(searchTerm, businessLineFilter, sectionFilter) {
        const resultsContainer = document.getElementById('search-results-content');
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h4>No results found</h4>
                    <p>No matches found for "${searchTerm}" in the selected filters.</p>
                </div>
            `;
        } else {
            let html = `<div class="search-summary">
                <p>Found ${this.searchResults.length} result(s) for "<strong>${searchTerm}</strong>"</p>
            </div>`;
            
            this.searchResults.forEach((result, index) => {
                const highlightedContent = this.highlightSearchTerm(result.content, searchTerm);
                
                html += `
                    <div class="search-result-item" onclick="bcpTracker.goToSearchResult(${index})">
                        <div class="search-result-meta">
                            <span class="search-result-badge">${result.businessLineTitle}</span>
                            <span class="search-result-badge">${this.getSectionDisplayName(result.sectionType)}</span>
                        </div>
                        <div class="search-result-content">
                            ${highlightedContent}
                        </div>
                    </div>
                `;
            });
            
            resultsContainer.innerHTML = html;
        }
        
        // Update title
        document.getElementById('search-results-title').textContent = 
            `Search Results (${this.searchResults.length})`;
        
        this.showSearchResults();
    }

    highlightSearchTerm(content, searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return content.replace(regex, '<span class="search-highlight">$1</span>');
    }

    getSectionDisplayName(sectionType) {
        const names = {
            'contacts': 'Emergency Contacts',
            'procedures': 'Emergency Procedures',
            'resources': 'Critical Resources',
            'recovery': 'Recovery Strategies',
            'communication': 'Communication Plan',
            'testing': 'Testing & Maintenance',
            'general': 'General'
        };
        return names[sectionType] || sectionType;
    }

    goToSearchResult(index) {
        const result = this.searchResults[index];
        if (result) {
            // Navigate to the specific business line and section
            this.showBCPDetails(result.businessLine)
                .then(() => this.showSectionDetails(result.sectionType));
        }
    }

    showSearchResults() {
        document.getElementById('welcome').classList.add('hidden');
        document.getElementById('bcp-content').classList.add('hidden');
        document.getElementById('section-content').classList.add('hidden');
        document.getElementById('search-results').classList.remove('hidden');
    }

    hideSearchResults() {
        document.getElementById('search-results').classList.add('hidden');
        this.showWelcomeScreen();
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        document.getElementById('business-line-filter').value = '';
        document.getElementById('section-filter').value = '';
        this.searchResults = [];
        this.hideSearchResults();
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        alert(message);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.bcpTracker = new BCPTracker();
});
