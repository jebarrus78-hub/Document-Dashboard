// BCP Data Tracker Application - Dynamic JSON Version
class BCPTracker {
    constructor() {
        this.currentLine = null;
        this.currentSection = null;
        this.bcpData = null;
        this.searchIndex = [];
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.loadBCPData();
            this.buildSearchIndex();
            this.initializeEventListeners();
            this.updateUI();
        } catch (error) {
            console.error('Failed to initialize BCP Tracker:', error);
            this.showError('Failed to load BCP data. Please check that bcp-data.json is available.');
        }
    }

    async loadBCPData() {
        try {
            const response = await fetch('bcp-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.bcpData = data.bcpPlans;
            console.log('BCP data loaded successfully:', Object.keys(this.bcpData).length, 'plans');
        } catch (error) {
            console.error('Error loading BCP data:', error);
            throw error;
        }
    }

    buildSearchIndex() {
        this.searchIndex = [];
        
        Object.keys(this.bcpData).forEach(lineId => {
            const plan = this.bcpData[lineId];
            
            Object.keys(plan.sections).forEach(sectionId => {
                const section = plan.sections[sectionId];
                
                // Index section content
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach((item, index) => {
                        this.searchIndex.push({
                            lineId,
                            sectionId,
                            itemIndex: index,
                            planTitle: plan.title,
                            sectionTitle: section.title,
                            content: this.extractSearchableText(item),
                            type: item.type || 'general'
                        });
                    });
                }
            });
        });
        
        console.log('Search index built:', this.searchIndex.length, 'items');
    }

    extractSearchableText(item) {
        let text = '';
        
        if (item.name) text += item.name + ' ';
        if (item.title) text += item.title + ' ';
        if (item.role) text += item.role + ' ';
        if (item.phone) text += item.phone + ' ';
        if (item.email) text += item.email + ' ';
        if (item.scenario) text += item.scenario + ' ';
        if (item.recovery) text += item.recovery + ' ';
        if (item.audience) text += item.audience + ' ';
        if (item.method) text += item.method + ' ';
        if (item.scope) text += item.scope + ' ';
        if (item.steps && Array.isArray(item.steps)) {
            text += item.steps.join(' ') + ' ';
        }
        
        return text.toLowerCase().trim();
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
            if (document.getElementById('search-input').value.trim()) {
                this.performSearch();
            }
        });

        document.getElementById('section-filter').addEventListener('change', () => {
            if (document.getElementById('search-input').value.trim()) {
                this.performSearch();
            }
        });
    }

    updateUI() {
        // Update stats
        const totalPlans = Object.keys(this.bcpData).length;
        document.querySelector('.stat-card h3').textContent = totalPlans;
    }

    showError(message) {
        const welcomeScreen = document.getElementById('welcome');
        welcomeScreen.innerHTML = `
            <h2>Error Loading BCP Data</h2>
            <p style="color: var(--text-secondary); margin: 2rem 0;">${message}</p>
            <div class="stat-card" style="background-color: #fee; border-color: #fcc;">
                <h3 style="color: #c33;">Error</h3>
                <p>Please check the console for details</p>
            </div>
        `;
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

    showBCPDetails(line) {
        this.currentLine = line;
        const bcpData = this.bcpData[line];
        
        if (!bcpData) {
            console.error('BCP data not found for line:', line);
            return;
        }

        // Update UI
        document.getElementById('welcome').classList.add('hidden');
        document.getElementById('bcp-content').classList.remove('hidden');
        document.getElementById('section-content').classList.add('hidden');
        this.hideSearchResults();
        
        // Update title
        document.getElementById('bcp-title').textContent = bcpData.title;
        
        // Update active state
        document.querySelectorAll('.business-line-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-line="${line}"]`).classList.add('active');
    }

    showSectionDetails(section) {
        if (!this.currentLine) {
            console.error('No current line selected');
            return;
        }

        this.currentSection = section;
        const bcpData = this.bcpData[this.currentLine];
        const sectionData = bcpData.sections[section];
        
        if (!sectionData) {
            console.error('Section data not found:', section);
            return;
        }

        // Update UI
        document.getElementById('bcp-content').classList.add('hidden');
        document.getElementById('section-content').classList.remove('hidden');
        this.hideSearchResults();
        
        // Update content
        document.getElementById('section-title').textContent = sectionData.title;
        document.getElementById('section-body').innerHTML = this.formatSectionContent(sectionData, section);
    }

    formatSectionContent(sectionData, sectionType) {
        if (!sectionData.content || !Array.isArray(sectionData.content)) {
            return '<p>No content available for this section.</p>';
        }

        let html = '';
        
        sectionData.content.forEach(item => {
            switch (item.type) {
                case 'contact':
                    html += this.formatContact(item);
                    break;
                case 'escalation':
                    html += this.formatEscalation(item);
                    break;
                case 'procedure':
                    html += this.formatProcedure(item);
                    break;
                case 'system':
                    html += this.formatSystem(item);
                    break;
                case 'strategy':
                    html += this.formatStrategy(item);
                    break;
                case 'internal':
                case 'external':
                    html += this.formatCommunication(item);
                    break;
                case 'test':
                case 'review':
                    html += this.formatTesting(item);
                    break;
                default:
                    html += this.formatGeneral(item);
            }
        });
        
        return html;
    }

    formatContact(contact) {
        return `
            <div class="contact-card">
                <h4>${contact.role}</h4>
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Phone:</strong> ${contact.phone}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Availability:</strong> ${contact.availability}</p>
            </div>
        `;
    }

    formatEscalation(escalation) {
        return `
            <div class="contact-card" style="border-left: 4px solid #ff6b6b;">
                <h4>${escalation.level}</h4>
                <p><strong>Name:</strong> ${escalation.name}</p>
                <p><strong>Phone:</strong> ${escalation.phone}</p>
                <p><strong>Email:</strong> ${escalation.email}</p>
            </div>
        `;
    }

    formatProcedure(procedure) {
        const steps = procedure.steps.map((step, index) => 
            `<li>${step}</li>`
        ).join('');
        
        return `
            <div class="procedure-step">
                <h4>${procedure.title}</h4>
                <ol>${steps}</ol>
            </div>
        `;
    }

    formatSystem(system) {
        return `
            <div class="system-card">
                <h4>${system.name}</h4>
                <p><strong>Criticality:</strong> <span class="criticality-${system.criticality.toLowerCase()}">${system.criticality}</span></p>
                <p><strong>Backup:</strong> ${system.backup}</p>
                <p><strong>RTO:</strong> ${system.rto} | <strong>RPO:</strong> ${system.rpo}</p>
            </div>
        `;
    }

    formatStrategy(strategy) {
        return `
            <div class="strategy-card">
                <h4>Scenario: ${strategy.scenario}</h4>
                <p><strong>Recovery:</strong> ${strategy.recovery}</p>
                <p><strong>Resources:</strong> ${strategy.resources}</p>
            </div>
        `;
    }

    formatCommunication(comm) {
        return `
            <div class="communication-card">
                <h4>${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} Communication</h4>
                <p><strong>Audience:</strong> ${comm.audience}</p>
                <p><strong>Method:</strong> ${comm.method}</p>
                <p><strong>Frequency:</strong> ${comm.frequency}</p>
            </div>
        `;
    }

    formatTesting(test) {
        return `
            <div class="testing-card">
                <h4>${test.name}</h4>
                <p><strong>Frequency:</strong> ${test.frequency}</p>
                <p><strong>Scope:</strong> ${test.scope}</p>
            </div>
        `;
    }

    formatGeneral(item) {
        return `
            <div class="general-card">
                <h4>${item.title || item.name || 'Information'}</h4>
                <p>${JSON.stringify(item, null, 2)}</p>
            </div>
        `;
    }

    performSearch() {
        const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
        const businessLineFilter = document.getElementById('business-line-filter').value;
        const sectionFilter = document.getElementById('section-filter').value;
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }

        // Filter search index
        let results = this.searchIndex.filter(item => {
            const matchesSearch = item.content.includes(searchTerm);
            const matchesBusinessLine = !businessLineFilter || item.lineId === businessLineFilter;
            const matchesSection = !sectionFilter || item.sectionId === sectionFilter;
            
            return matchesSearch && matchesBusinessLine && matchesSection;
        });

        this.displaySearchResults(results, searchTerm);
    }

    displaySearchResults(results, searchTerm) {
        const searchResults = document.getElementById('search-results');
        const searchResultsContent = document.getElementById('search-results-content');
        const searchResultsTitle = document.getElementById('search-results-title');
        
        // Hide other views
        document.getElementById('welcome').classList.add('hidden');
        document.getElementById('bcp-content').classList.add('hidden');
        document.getElementById('section-content').classList.add('hidden');
        
        // Show search results
        searchResults.classList.remove('hidden');
        
        // Update title
        searchResultsTitle.textContent = `Search Results (${results.length} found)`;
        
        if (results.length === 0) {
            searchResultsContent.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>No matches found for "${searchTerm}". Try different keywords or check your filters.</p>
                </div>
            `;
            return;
        }

        // Group results by business line
        const groupedResults = results.reduce((groups, result) => {
            if (!groups[result.lineId]) {
                groups[result.lineId] = [];
            }
            groups[result.lineId].push(result);
            return groups;
        }, {});

        let html = '';
        Object.keys(groupedResults).forEach(lineId => {
            const lineResults = groupedResults[lineId];
            const planTitle = lineResults[0].planTitle;
            
            html += `
                <div class="search-result-group">
                    <h3 class="business-line-header">${planTitle}</h3>
                    <div class="search-results-list">
            `;
            
            lineResults.forEach(result => {
                const originalItem = this.bcpData[result.lineId].sections[result.sectionId].content[result.itemIndex];
                html += `
                    <div class="search-result-item" data-line="${result.lineId}" data-section="${result.sectionId}">
                        <div class="result-header">
                            <h4>${result.sectionTitle}</h4>
                            <span class="result-type">${result.type}</span>
                        </div>
                        <div class="result-content">
                            ${this.formatSearchResultContent(originalItem, searchTerm)}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        searchResultsContent.innerHTML = html;

        // Add click handlers for search results
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const lineId = e.currentTarget.getAttribute('data-line');
                const sectionId = e.currentTarget.getAttribute('data-section');
                this.hideSearchResults();
                this.showBCPDetails(lineId);
                setTimeout(() => this.showSectionDetails(sectionId), 100);
            });
        });
    }

    formatSearchResultContent(item, searchTerm) {
        switch (item.type) {
            case 'contact':
            case 'escalation':
                return `<p><strong>${item.role}:</strong> ${item.name} - ${item.phone}</p>`;
            case 'procedure':
                return `<p><strong>${item.title}</strong></p><p>${item.steps[0]}...</p>`;
            case 'system':
                return `<p><strong>${item.name}</strong> (${item.criticality}) - RTO: ${item.rto}</p>`;
            case 'strategy':
                return `<p><strong>${item.scenario}:</strong> ${item.recovery}</p>`;
            default:
                return `<p>${item.name || item.title || 'Information available'}</p>`;
        }
    }

    hideSearchResults() {
        document.getElementById('search-results').classList.add('hidden');
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        document.getElementById('business-line-filter').value = '';
        document.getElementById('section-filter').value = '';
        this.hideSearchResults();
        if (!this.currentLine) {
            this.showWelcomeScreen();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.bcpTracker = new BCPTracker();
});
