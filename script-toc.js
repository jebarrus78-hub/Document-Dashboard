// BCP Data Tracker - Table of Contents Based Version
class BCPTrackerTOC {
    constructor() {
        console.log('BCPTrackerTOC constructor called');
        this.currentLine = null;
        this.currentSection = null;
        this.bcpData = null;
        this.searchIndex = [];
        console.log('Starting initializeApp...');
        this.initializeApp();
    }

    async initializeApp() {
        // Always initialize event listeners first, regardless of data loading
        this.initializeEventListeners();
        
        try {
            await this.loadBCPData();
            this.buildSearchIndex();
            this.updateUI();
        } catch (error) {
            console.error('Failed to initialize BCP Tracker:', error);
            this.showError('Failed to load BCP data. Please check that bcp-data-final.json is available.');
        }
    }

    async loadBCPData() {
        try {
            const response = await fetch('bcp-data-final.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.bcpData = data.bcpPlans;
            console.log('Final BCP data loaded successfully:', Object.keys(this.bcpData).length, 'plans');
        } catch (error) {
            console.error('Error loading final BCP data:', error);
            throw error;
        }
    }

    buildSearchIndex() {
        this.searchIndex = [];
        
        Object.keys(this.bcpData).forEach(lineId => {
            const plan = this.bcpData[lineId];
            
            // Index table of contents items
            if (plan.tableOfContents) {
                plan.tableOfContents.forEach(tocItem => {
                    this.searchIndex.push({
                        lineId,
                        sectionId: tocItem.key,
                        planTitle: plan.title,
                        sectionTitle: tocItem.title,
                        content: tocItem.title.toLowerCase(),
                        type: 'toc'
                    });
                });
            }
            
            // Index section content
            Object.keys(plan.sections || {}).forEach(sectionId => {
                const section = plan.sections[sectionId];
                
                if (section.content && Array.isArray(section.content)) {
                    section.content.forEach((item, index) => {
                        this.searchIndex.push({
                            lineId,
                            sectionId,
                            itemIndex: index,
                            planTitle: plan.title,
                            sectionTitle: section.title,
                            content: this.extractSearchableText(item),
                            type: section.type || 'general'
                        });
                    });
                }
            });
        });
        
        console.log('Search index built:', this.searchIndex.length, 'items');
    }

    extractSearchableText(item) {
        let text = '';
        
        if (item.text) text += item.text + ' ';
        if (item.content) text += item.content + ' ';
        if (item.emails && Array.isArray(item.emails)) text += item.emails.join(' ') + ' ';
        if (item.phones && Array.isArray(item.phones)) text += item.phones.join(' ') + ' ';
        if (item.data && Array.isArray(item.data)) {
            // For table data
            item.data.forEach(row => {
                if (Array.isArray(row)) {
                    text += row.join(' ') + ' ';
                }
            });
        }
        
        return text.toLowerCase().trim();
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Business line buttons
        const businessLineBtns = document.querySelectorAll('.business-line-btn');
        console.log('Found business line buttons:', businessLineBtns.length);
        businessLineBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const line = e.target.getAttribute('data-line');
                console.log('Business line clicked:', line);
                this.showBCPDetails(line);
            });
        });

        // Back buttons
        const backBtn = document.getElementById('back-btn');
        console.log('Back button found:', !!backBtn);
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('Back to dashboard clicked');
                this.showWelcomeScreen();
            });
        }

        const sectionBackBtn = document.getElementById('section-back-btn');
        console.log('Section back button found:', !!sectionBackBtn);
        if (sectionBackBtn) {
            sectionBackBtn.addEventListener('click', () => {
                console.log('Section back button clicked, currentLine:', this.currentLine, 'currentSection:', this.currentSection);
                if (this.currentLine) {
                    this.currentSection = null; // Clear current section
                    console.log('Navigating back to table of contents for:', this.currentLine);
                    this.showBCPDetails(this.currentLine);
                } else {
                    console.log('No current line, returning to welcome screen');
                    this.showWelcomeScreen();
                }
            });
        }

        const searchBackBtn = document.getElementById('search-back-btn');
        if (searchBackBtn) {
            searchBackBtn.addEventListener('click', () => {
                this.hideSearchResults();
            });
        }

        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        const clearSearchBtn = document.getElementById('clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Filter change handlers
        const businessLineFilter = document.getElementById('business-line-filter');
        if (businessLineFilter) {
            businessLineFilter.addEventListener('change', () => {
                if (document.getElementById('search-input').value.trim()) {
                    this.performSearch();
                }
            });
        }

        const sectionFilter = document.getElementById('section-filter');
        if (sectionFilter) {
            sectionFilter.addEventListener('change', () => {
                if (document.getElementById('search-input').value.trim()) {
                    this.performSearch();
                }
            });
        }
        
        console.log('Event listeners initialization complete');
    }

    updateUI() {
        // Simple initialization - no complex overview needed
        console.log('BCP Tracker initialized with', Object.keys(this.bcpData).length, 'business lines');
    }

    showError(message) {
        const welcomeScreen = document.getElementById('welcome');
        welcomeScreen.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2>Error Loading BCP Data</h2>
                <p style="color: var(--text-secondary); margin: 2rem 0;">${message}</p>
                <div class="stat-card" style="background-color: #fee; border-color: #fcc; display: inline-block;">
                    <h3 style="color: #c33;">Error</h3>
                    <p>Please check the console for details</p>
                </div>
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
        this.currentSection = null; // Clear current section when showing plan
        const bcpData = this.bcpData[line];
        
        if (!bcpData) {
            console.error('BCP data not found for line:', line);
            return;
        }

        console.log('Showing BCP details for:', line, 'with TOC items:', bcpData.tableOfContents?.length || 0);

        // Update UI
        document.getElementById('welcome').classList.add('hidden');
        document.getElementById('bcp-content').classList.remove('hidden');
        document.getElementById('section-content').classList.add('hidden');
        this.hideSearchResults();
        
        // Clear any active TOC states
        document.querySelectorAll('.toc-level-1, .toc-level-2').forEach(item => {
            item.classList.remove('toc-active');
        });
        
        // Update title
        document.getElementById('bcp-title').textContent = bcpData.title;
        
        // Generate table of contents
        this.generateTableOfContents(bcpData);
        
        // Update active state
        document.querySelectorAll('.business-line-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-line="${line}"]`).classList.add('active');
    }

    generateTableOfContents(bcpData) {
        const tocContainer = document.getElementById('toc-container');
        
        if (!bcpData.tableOfContents || bcpData.tableOfContents.length === 0) {
            tocContainer.innerHTML = '<p>No table of contents available</p>';
            return;
        }

        // Group TOC items by main sections
        const groupedTOC = this.groupTOCItems(bcpData.tableOfContents);
        
        let tocHTML = '';
        
        groupedTOC.forEach(section => {
            tocHTML += `
                <div class="toc-section-container">
                    <div class="toc-level-1" data-section="${section.key}" data-toggle-section="${section.key}">
                        <span>${section.title}</span>
                        <span class="toc-expand-icon">▶</span>
                    </div>
            `;
            
            if (section.subsections && section.subsections.length > 0) {
                tocHTML += `<div class="toc-subsections" data-section-group="${section.key}">`;
                section.subsections.forEach(subsection => {
                    tocHTML += `
                        <div class="toc-level-2" data-section="${subsection.key}">
                            ${subsection.title}
                        </div>
                    `;
                });
                tocHTML += `</div>`;
            }
            
            tocHTML += `</div>`;
        });
        
        tocContainer.innerHTML = tocHTML;
        
        // Add click handlers for main sections (toggle)
        tocContainer.querySelectorAll('[data-toggle-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionKey = e.currentTarget.getAttribute('data-toggle-section');
                
                // Check if clicking on the expand icon area
                const isIconClick = e.target.classList.contains('toc-expand-icon');
                const hasSubsections = item.parentElement.querySelector('.toc-subsections').children.length > 0;
                
                if (isIconClick || hasSubsections) {
                    this.toggleTOCSection(sectionKey);
                } else {
                    // No subsections, navigate directly
                    this.showSectionDetails(sectionKey);
                }
            });
        });
        
        // Add click handlers for subsections (navigate)
        tocContainer.querySelectorAll('.toc-level-2[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionKey = e.target.getAttribute('data-section');
                this.showSectionDetails(sectionKey);
            });
        });
        
        // Add click handlers for main sections when they have no subsections
        tocContainer.querySelectorAll('.toc-level-1[data-section]:not([data-toggle-section])').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionKey = e.target.getAttribute('data-section');
                this.showSectionDetails(sectionKey);
            });
        });
    }

    groupTOCItems(tocItems) {
        const grouped = [];
        let currentSection = null;
        
        tocItems.forEach(item => {
            if (item.level === 1) {
                // Start new main section
                if (currentSection) {
                    grouped.push(currentSection);
                }
                currentSection = {
                    key: item.key,
                    title: item.title,
                    level: item.level,
                    subsections: []
                };
            } else if (item.level === 2 && currentSection) {
                // Add to current section's subsections
                currentSection.subsections.push(item);
            }
        });
        
        // Don't forget the last section
        if (currentSection) {
            grouped.push(currentSection);
        }
        
        return grouped;
    }

    toggleTOCSection(sectionKey) {
        const mainButton = document.querySelector(`[data-toggle-section="${sectionKey}"]`);
        const subsectionsContainer = document.querySelector(`[data-section-group="${sectionKey}"]`);
        
        if (!mainButton || !subsectionsContainer) return;
        
        const isExpanded = mainButton.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            mainButton.classList.remove('expanded');
            subsectionsContainer.classList.remove('expanded');
        } else {
            // Expand
            mainButton.classList.add('expanded');
            subsectionsContainer.classList.add('expanded');
        }
        
        // If main section has no subsections, navigate to it directly
        if (subsectionsContainer.children.length === 0) {
            this.showSectionDetails(sectionKey);
        }
    }

    showSectionDetails(sectionKey) {
        if (!this.currentLine) {
            console.error('No current line selected');
            return;
        }

        this.currentSection = sectionKey;
        const bcpData = this.bcpData[this.currentLine];
        const sectionData = bcpData.sections[sectionKey];
        
        // Update active state in TOC
        document.querySelectorAll('.toc-level-1, .toc-level-2').forEach(item => {
            item.classList.remove('toc-active');
        });
        
        const activeElement = document.querySelector(`[data-section="${sectionKey}"]`);
        if (activeElement) {
            activeElement.classList.add('toc-active');
            
            // If it's a level-2 item, also expand its parent section
            if (activeElement.classList.contains('toc-level-2')) {
                const parentContainer = activeElement.closest('.toc-section-container');
                if (parentContainer) {
                    const parentButton = parentContainer.querySelector('.toc-level-1');
                    const subsectionsContainer = parentContainer.querySelector('.toc-subsections');
                    if (parentButton && subsectionsContainer) {
                        parentButton.classList.add('expanded');
                        subsectionsContainer.classList.add('expanded');
                    }
                }
            }
        }
        
        if (!sectionData) {
            // Section might be a TOC item without content - provide comprehensive handling
            const tocItem = bcpData.tableOfContents.find(item => item.key === sectionKey);
            if (tocItem) {
                document.getElementById('bcp-content').classList.add('hidden');
                document.getElementById('section-content').classList.remove('hidden');
                document.getElementById('section-title').textContent = tocItem.title;
                
                // Generate comprehensive content based on section type and title
                const virtualContent = this.generateVirtualSectionContent(tocItem, bcpData);
                document.getElementById('section-body').innerHTML = virtualContent;
                return;
            }
            
            console.error('Section data not found:', sectionKey);
            return;
        }

        // Update UI
        document.getElementById('bcp-content').classList.add('hidden');
        document.getElementById('section-content').classList.remove('hidden');
        this.hideSearchResults();
        
        // Update content
        document.getElementById('section-title').textContent = sectionData.title;
        document.getElementById('section-body').innerHTML = this.formatSectionContent(sectionData);
    }

    formatSectionContent(sectionData) {
        if (!sectionData.content || !Array.isArray(sectionData.content)) {
            return '<p>No content available for this section.</p>';
        }

        let html = '';
        
        // Enhanced handling for all BFT sections across all business lines
        if (sectionData.title && sectionData.title.includes('Business Function Team')) {
            // First, check if we have structured BFT contact data
            const contactsItems = sectionData.content.filter(item => item.type === 'contacts');
            let hasStructuredBFT = false;
            
            for (const contactsItem of contactsItems) {
                if (contactsItem.content && Array.isArray(contactsItem.content)) {
                    const hasBFTData = contactsItem.content.some(contact => 
                        contact.type === 'team_member' && 
                        (contact.phone?.length > 0 || contact.mobile?.length > 0)
                    );
                    
                    if (hasBFTData) {
                        hasStructuredBFT = true;
                        // Render BFT table first and prominently
                        html += '<div class="bft-priority-section">';
                        html += '<h3>Business Function Team Contacts</h3>';
                        html += this.formatContactsList(contactsItem);
                        html += '</div>';
                        break; // Only render the first BFT contacts table
                    }
                }
            }
            
            // If we found structured BFT data, render other content after
            if (hasStructuredBFT) {
                html += '<div class="bft-additional-info">';
                sectionData.content.forEach(item => {
                    if (item.type !== 'contacts') {
                        html += this.formatContentItem(item);
                    }
                });
                html += '</div>';
                return html;
            } else {
                // Fallback for BFT sections without structured data
                html += '<div class="bft-priority-section">';
                html += '<h3>Business Function Team Information</h3>';
                
                // Render all content with enhanced formatting
                sectionData.content.forEach(item => {
                    html += this.formatContentItem(item);
                });
                
                html += '</div>';
                return html;
            }
        }

        // Enhanced handling for CFT sections
        if (sectionData.title && (sectionData.title.includes('Cross-Functional Team') || sectionData.title.includes('CFT'))) {
            const contactsItems = sectionData.content.filter(item => item.type === 'contacts');
            
            if (contactsItems.length > 0) {
                html += '<div class="cft-priority-section">';
                html += '<h3>Cross-Functional Team Information</h3>';
                contactsItems.forEach(contactsItem => {
                    html += this.formatContactsList(contactsItem);
                });
                html += '</div>';
                
                // Render other content after
                html += '<div class="cft-additional-info">';
                sectionData.content.forEach(item => {
                    if (item.type !== 'contacts') {
                        html += this.formatContentItem(item);
                    }
                });
                html += '</div>';
                return html;
            }
        }

        // Enhanced handling for Recovery Teams sections
        if (sectionData.title && sectionData.title.toLowerCase().includes('recovery team')) {
            html += '<div class="recovery-teams-section">';
            html += '<h3>Recovery Teams Information</h3>';
            
            // Group content by type for better organization
            const contactsItems = sectionData.content.filter(item => item.type === 'contacts');
            const textItems = sectionData.content.filter(item => item.type === 'text');
            const otherItems = sectionData.content.filter(item => !['contacts', 'text'].includes(item.type));
            
            // Render contacts first
            if (contactsItems.length > 0) {
                contactsItems.forEach(item => {
                    html += this.formatContactsList(item);
                });
            }
            
            // Then text content
            if (textItems.length > 0) {
                textItems.forEach(item => {
                    html += this.formatContentItem(item);
                });
            }
            
            // Finally other content
            if (otherItems.length > 0) {
                otherItems.forEach(item => {
                    html += this.formatContentItem(item);
                });
            }
            
            html += '</div>';
            return html;
        }

        // Enhanced handling for Activation/Engagement sections
        if (sectionData.title && (sectionData.title.toLowerCase().includes('activation') || 
                                   sectionData.title.toLowerCase().includes('engagement'))) {
            html += '<div class="activation-section">';
            html += '<h3>Activation Guide</h3>';
            
            sectionData.content.forEach(item => {
                html += this.formatContentItem(item);
            });
            
            html += '</div>';
            return html;
        }

        // Enhanced handling for Recovery Strategies sections
        if (sectionData.title && sectionData.title.toLowerCase().includes('recovery strateg')) {
            html += '<div class="recovery-strategies-section">';
            html += '<h3>Recovery Strategies</h3>';
            
            sectionData.content.forEach(item => {
                html += this.formatContentItem(item);
            });
            
            html += '</div>';
            return html;
        }

        // Enhanced handling for Dependencies sections
        if (sectionData.title && sectionData.title.toLowerCase().includes('dependenc')) {
            html += '<div class="dependencies-section">';
            html += '<h3>Dependencies Information</h3>';
            
            sectionData.content.forEach(item => {
                html += this.formatContentItem(item);
            });
            
            html += '</div>';
            return html;
        }
        
        // Default rendering for all other sections with improved organization
        html += '<div class="section-content-wrapper">';
        
        // Group content by type for better presentation
        const groupedContent = {
            contacts: sectionData.content.filter(item => item.type === 'contacts'),
            procedures: sectionData.content.filter(item => item.type === 'procedure'),
            tables: sectionData.content.filter(item => item.type === 'table'),
            text: sectionData.content.filter(item => item.type === 'text'),
            other: sectionData.content.filter(item => !['contacts', 'procedure', 'table', 'text'].includes(item.type))
        };

        // Render in priority order: contacts, procedures, tables, text, other
        ['contacts', 'procedures', 'tables', 'text', 'other'].forEach(type => {
            if (groupedContent[type] && groupedContent[type].length > 0) {
                groupedContent[type].forEach(item => {
                    html += this.formatContentItem(item);
                });
            }
        });
        
        html += '</div>';
        return html;
    }

    formatContentItem(item) {
        switch (item.type) {
            case 'contact':
                return this.formatContact(item);
            case 'contacts':
                return this.formatContactsList(item);
            case 'procedure':
                return this.formatProcedure(item);
            case 'text':
                return this.formatText(item);
            case 'table':
                return this.formatTable(item);
            default:
                return this.formatGeneral(item);
        }
    }

    formatContact(contact) {
        if (contact.type === 'team_member') {
            return this.formatTeamMember(contact);
        }
        
        // Legacy contact format
        let html = `<div class="contact-info">`;
        
        if (contact.text) {
            html += `<h4>Contact Information</h4><p>${contact.text}</p>`;
        }
        
        if (contact.emails && contact.emails.length > 0) {
            html += `<p><strong>Email:</strong> `;
            contact.emails.forEach(email => {
                html += `<span class="email">${email}</span> `;
            });
            html += `</p>`;
        }
        
        if (contact.phones && contact.phones.length > 0) {
            html += `<p><strong>Phone:</strong> `;
            contact.phones.forEach(phone => {
                html += `<span class="phone">${phone}</span> `;
            });
            html += `</p>`;
        }
        
        html += `</div>`;
        return html;
    }

    formatTeamMember(member) {
        // Additional validation - skip if name looks like a role/function rather than person
        if (!member.name || 
            member.name.toLowerCase().includes('management') ||
            member.name.toLowerCase().includes('preparedness') ||
            member.name.toLowerCase().includes('response') ||
            member.name.toLowerCase().includes('team') ||
            member.name.toLowerCase().includes('department') ||
            member.name.toLowerCase().includes('function') ||
            member.name.toLowerCase().includes('crisis') ||
            member.name.length < 3 ||
            member.name.length > 50) {
            return ''; // Skip this entry
        }
        
        let html = `<div class="team-member-card">`;
        
        // Name and title header
        html += `<div class="member-header">`;
        html += `<h4 class="member-name">${member.name}</h4>`;
        if (member.title && member.title !== "None" && member.title !== "") {
            html += `<p class="member-title">${member.title}</p>`;
        }
        html += `</div>`;
        
        // Contact details
        html += `<div class="member-contact-details">`;
        
        // Phone numbers
        if (member.phone && member.phone.length > 0) {
            const validPhones = member.phone.filter(phone => phone && phone.trim() && phone !== "N/A");
            if (validPhones.length > 0) {
                html += `<div class="contact-item">`;
                html += `<span class="contact-label">Phone:</span>`;
                validPhones.forEach(phone => {
                    html += `<span class="contact-value phone">${phone}</span>`;
                });
                html += `</div>`;
            }
        }
        
        // Mobile numbers
        if (member.mobile && member.mobile.length > 0) {
            const validMobiles = member.mobile.filter(mobile => mobile && mobile.trim() && mobile !== "N/A");
            if (validMobiles.length > 0) {
                html += `<div class="contact-item">`;
                html += `<span class="contact-label">Mobile:</span>`;
                validMobiles.forEach(mobile => {
                    html += `<span class="contact-value mobile">${mobile}</span>`;
                });
                html += `</div>`;
            }
        }
        
        // Email addresses
        if (member.email && member.email.length > 0) {
            const validEmails = member.email.filter(email => email && email.trim() && email !== "N/A");
            if (validEmails.length > 0) {
                html += `<div class="contact-item">`;
                html += `<span class="contact-label">Email:</span>`;
                validEmails.forEach(email => {
                    html += `<span class="contact-value email">${email}</span>`;
                });
                html += `</div>`;
            }
        }
        
        // Location
        if (member.location && member.location !== "N/A" && member.location.trim()) {
            html += `<div class="contact-item">`;
            html += `<span class="contact-label">Location:</span>`;
            html += `<span class="contact-value location">${member.location}</span>`;
            html += `</div>`;
        }
        
        // Description
        if (member.description && member.description !== "N/A" && member.description.trim() && member.description.length < 200) {
            html += `<div class="contact-item">`;
            html += `<span class="contact-label">Description:</span>`;
            html += `<span class="contact-value description">${member.description}</span>`;
            html += `</div>`;
        }
        
        html += `</div></div>`;
        return html;
    }

    formatContactsList(contactsItem) {
        if (!contactsItem.content || !Array.isArray(contactsItem.content)) {
            return '<p>No contacts available.</p>';
        }

        // Check if this is BFT data (team_member contacts with phone/mobile)
        const hasBFTData = contactsItem.content.some(contact => 
            contact.type === 'team_member' && 
            (contact.phone?.length > 0 || contact.mobile?.length > 0)
        );

        if (hasBFTData) {
            return this.formatBFTTable(contactsItem.content);
        }

        // For CFT or other group data, use the existing card format
        let html = '<div class="contacts-section">';
        
        contactsItem.content.forEach(contact => {
            if (contact.type === 'team_member') {
                html += this.formatTeamMember(contact);
            } else if (contact.type === 'team_group') {
                html += this.formatTeamGroup(contact);
            } else {
                // Handle legacy contact format
                html += this.formatContact(contact);
            }
        });
        
        html += '</div>';
        return html;
    }

    formatBFTTable(contacts) {
        let html = '<div class="bft-table-container">';
        
        // Add the e-page information
        html += '<p><strong>Cisco e-page:</strong> tac-bft (<a href="#" onclick="alert(\'Link to NaaS [E-Page]\')">Link to NaaS [E-Page]</a>)</p>';
        html += '<p>If ePage is down (or recipient is not using NaaS), utilize the following <strong>workarounds</strong></p>';
        
        // Create the table
        html += '<table class="bft-contacts-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Name / User ID</th>';
        html += '<th>Title/Role</th>';
        html += '<th>Location</th>';
        html += '<th>Phone Number</th>';
        html += '<th>Mobile Number</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        
        // Filter and sort contacts
        const validContacts = contacts.filter(contact => 
            contact.type === 'team_member' && 
            contact.name && 
            contact.name.length > 2 && 
            !contact.name.toLowerCase().includes('management') &&
            !contact.name.toLowerCase().includes('team')
        );
        
        validContacts.forEach(contact => {
            html += '<tr>';
            
            // Name / User ID
            const displayName = contact.raw_name || `${contact.name}${contact.userid ? ` (${contact.userid})` : ''}`;
            html += `<td>${displayName}</td>`;
            
            // Title/Role
            html += `<td>${contact.title || ''}</td>`;
            
            // Location
            html += `<td>${contact.location || ''}</td>`;
            
            // Phone Number
            const phone = contact.phone && contact.phone.length > 0 ? contact.phone[0] : '';
            html += `<td>${phone}</td>`;
            
            // Mobile Number
            const mobile = contact.mobile && contact.mobile.length > 0 ? contact.mobile[0] : '';
            html += `<td>${mobile}</td>`;
            
            html += '</tr>';
        });
        
        html += '</tbody>';
        html += '</table>';
        html += '</div>';
        
        return html;
    }

    formatTeamGroup(group) {
        let html = `<div class="team-group-card">`;
        
        // Group header
        html += `<div class="group-header">`;
        html += `<h4 class="group-name">${group.name}</h4>`;
        if (group.title && group.title !== "None" && group.title !== "") {
            html += `<p class="group-title">${group.title}</p>`;
        }
        html += `</div>`;
        
        // Group details
        html += `<div class="group-details">`;
        
        if (group.location && group.location !== "N/A" && group.location.trim()) {
            html += `<div class="contact-item">`;
            html += `<span class="contact-label">Location:</span>`;
            html += `<span class="contact-value location">${group.location}</span>`;
            html += `</div>`;
        }
        
        if (group.description && group.description !== "N/A" && group.description.trim()) {
            html += `<div class="contact-item">`;
            html += `<span class="contact-label">Description:</span>`;
            html += `<span class="contact-value description">${group.description}</span>`;
            html += `</div>`;
        }
        
        html += `</div></div>`;
        return html;
    }

    formatProcedure(procedure) {
        let html = `<div class="section-content-item">`;
        html += `<h4>${procedure.title || 'Procedure'}</h4>`;
        
        if (procedure.steps && Array.isArray(procedure.steps)) {
            html += `<ol>`;
            procedure.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += `</ol>`;
        }
        
        html += `</div>`;
        return html;
    }

    formatText(textItem) {
        // Enhanced handling for all BFT fallback text across all business lines
        if (textItem.content && textItem.content.includes('See Business Function Team (BFT) section in document')) {
            return `
                <div class="section-content-item">
                    <div class="fallback-notice" style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                        <h4 style="color: #856404; margin-top: 0;">⚠️ Limited BFT Information Available</h4>
                        <p style="color: #856404; margin-bottom: 0.5rem;">${textItem.content}</p>
                        <p style="color: #856404; margin-bottom: 0;"><strong>💡 For detailed BFT contact information, please:</strong></p>
                        <div style="margin-top: 12px;">
                            <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                                � Search All BFT Sections
                            </button>
                            <button onclick="window.bcpTracker.searchForSection('contact')" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                � Find Contact Information
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Enhanced handling for CFT fallback text
        if (textItem.content && (textItem.content.includes('See Cross-Functional Team') || 
                                 textItem.content.includes('See CFT'))) {
            return `
                <div class="section-content-item">
                    <div class="fallback-notice" style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                        <h4 style="color: #004085; margin-top: 0;">ℹ️ CFT Information Reference</h4>
                        <p style="color: #004085; margin-bottom: 0.5rem;">${textItem.content}</p>
                        <button onclick="window.bcpTracker.searchForSection('cross-functional team')" style="background: #17a2b8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                            🔍 Search All CFT Sections
                        </button>
                    </div>
                </div>
            `;
        }

        // Enhanced handling for generic "See section X" references
        if (textItem.content && textItem.content.toLowerCase().includes('see ') && 
            textItem.content.toLowerCase().includes(' section')) {
            const sectionReference = textItem.content.match(/see\s+(.+?)\s+section/i);
            if (sectionReference) {
                const referencedSection = sectionReference[1];
                return `
                    <div class="section-content-item">
                        <div class="section-reference" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-left: 4px solid #6c757d; padding: 1rem; margin: 1rem 0;">
                            <h4 style="color: #495057; margin-top: 0;">📖 Section Reference</h4>
                            <p style="color: #495057; margin-bottom: 0.5rem;">${textItem.content}</p>
                            <button onclick="window.bcpTracker.searchForSection('${referencedSection.toLowerCase()}')" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                                🔍 Search for "${referencedSection}"
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        // Enhanced handling for contact information with special formatting
        if (textItem.content && (textItem.content.includes('@') || textItem.content.includes('phone') || 
                                 textItem.content.includes('contact') || textItem.content.includes('email'))) {
            return `
                <div class="section-content-item contact-info-text">
                    <div style="background-color: #f8f9fa; border-left: 4px solid #007acc; padding: 1rem; margin: 1rem 0;">
                        <p style="margin: 0; line-height: 1.6;">${this.formatContactText(textItem.content)}</p>
                    </div>
                </div>
            `;
        }

        // Enhanced handling for procedure/step text
        if (textItem.content && (textItem.content.toLowerCase().includes('step ') || 
                                 textItem.content.toLowerCase().includes('procedure') ||
                                 textItem.content.toLowerCase().includes('process'))) {
            return `
                <div class="section-content-item procedure-text">
                    <div style="background-color: #fff8e7; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0;">
                        <p style="margin: 0; line-height: 1.6;">${textItem.content}</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="section-content-item">
                <p style="line-height: 1.6;">${textItem.content}</p>
            </div>
        `;
    }

    formatContactText(text) {
        // Enhanced formatting for contact information
        return text
            .replace(/(\w+@\w+\.\w+)/g, '<a href="mailto:$1" style="color: #007acc; text-decoration: none;">$1</a>')
            .replace(/(\+?\d[\d\s\-\(\)]+\d)/g, '<span style="font-weight: 600; color: #28a745;">$1</span>')
            .replace(/(phone|email|contact)/gi, '<strong>$1</strong>');
    }

    formatTable(tableItem) {
        if (!tableItem.data || !Array.isArray(tableItem.data)) {
            return '';
        }

        let html = `<div class="section-content-table"><table>`;
        
        // First row as header
        if (tableItem.data.length > 0) {
            html += `<thead><tr>`;
            tableItem.data[0].forEach(cell => {
                html += `<th>${cell}</th>`;
            });
            html += `</tr></thead>`;
        }
        
        // Rest as body
        if (tableItem.data.length > 1) {
            html += `<tbody>`;
            for (let i = 1; i < tableItem.data.length; i++) {
                html += `<tr>`;
                tableItem.data[i].forEach(cell => {
                    html += `<td>${cell}</td>`;
                });
                html += `</tr>`;
            }
            html += `</tbody>`;
        }
        
        html += `</table></div>`;
        return html;
    }

    formatGeneral(item) {
        return `
            <div class="section-content-item">
                <h4>${item.title || 'Information'}</h4>
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
            
            // Enhanced section filtering based on TOC titles and content
            let matchesSection = true;
            if (sectionFilter) {
                const sectionTitle = item.sectionTitle.toLowerCase();
                switch (sectionFilter) {
                    case 'introduction':
                        matchesSection = sectionTitle.includes('introduction') || sectionTitle.includes('objective') || 
                                       sectionTitle.includes('scope') || sectionTitle.includes('purpose');
                        break;
                    case 'activation':
                        matchesSection = sectionTitle.includes('activation') || sectionTitle.includes('engagement') || 
                                       sectionTitle.includes('when to activate') || sectionTitle.includes('quick');
                        break;
                    case 'recovery_teams':
                        matchesSection = sectionTitle.includes('recovery teams') || sectionTitle.includes('bft') || 
                                       sectionTitle.includes('business function') || sectionTitle.includes('cft') || 
                                       sectionTitle.includes('cross-functional');
                        break;
                    case 'procedures':
                        matchesSection = sectionTitle.includes('procedures') || sectionTitle.includes('crisis') || 
                                       sectionTitle.includes('communication') || sectionTitle.includes('step') || 
                                       sectionTitle.includes('process');
                        break;
                    case 'recovery_strategies':
                        matchesSection = sectionTitle.includes('recovery strategies') || sectionTitle.includes('business critical') || 
                                       sectionTitle.includes('workarounds') || sectionTitle.includes('continuity strategy');
                        break;
                    case 'dependencies':
                        matchesSection = sectionTitle.includes('dependencies') || sectionTitle.includes('upstream') || 
                                       sectionTitle.includes('downstream') || sectionTitle.includes('other dependencies');
                        break;
                    case 'personnel':
                        matchesSection = sectionTitle.includes('personnel') || sectionTitle.includes('shortage') || 
                                       sectionTitle.includes('staffing') || sectionTitle.includes('pandemic');
                        break;
                    case 'scenarios':
                        matchesSection = sectionTitle.includes('scenarios') || sectionTitle.includes('appendix a') || 
                                       sectionTitle.includes('recovery scenarios');
                        break;
                    case 'directory':
                        matchesSection = sectionTitle.includes('directory') || sectionTitle.includes('appendix b') || 
                                       sectionTitle.includes('contact');
                        break;
                    case 'communication':
                        matchesSection = sectionTitle.includes('communication') || sectionTitle.includes('crisis comm') || 
                                       sectionTitle.includes('notification') || sectionTitle.includes('alert');
                        break;
                    case 'technology':
                        matchesSection = sectionTitle.includes('technology') || sectionTitle.includes('tools') || 
                                       sectionTitle.includes('application') || sectionTitle.includes('system') || 
                                       sectionTitle.includes('outage');
                        break;
                    case 'building':
                        matchesSection = sectionTitle.includes('building') || sectionTitle.includes('location') || 
                                       sectionTitle.includes('facility') || sectionTitle.includes('site');
                        break;
                    case 'vendor':
                        matchesSection = sectionTitle.includes('vendor') || sectionTitle.includes('supplier') || 
                                       sectionTitle.includes('third party') || sectionTitle.includes('partner');
                        break;
                    default:
                        matchesSection = true;
                }
            }
            
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
                html += `
                    <div class="search-result-item" data-line="${result.lineId}" data-section="${result.sectionId}">
                        <div class="result-header">
                            <h4>${result.sectionTitle}</h4>
                            <span class="result-type">${result.type}</span>
                        </div>
                        <div class="result-content">
                            <p>Match found in ${result.sectionTitle}</p>
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

    navigateToBFT() {
        // Find the first business line with structured BFT data
        for (const [lineId, plan] of Object.entries(this.bcpData)) {
            for (const [sectionId, section] of Object.entries(plan.sections || {})) {
                if (section.title && section.title.includes('Business Function Team')) {
                    // Check if it has structured contact data
                    const hasStructuredData = section.content?.some(item => 
                        item.type === 'contacts' && 
                        item.content?.some(contact => 
                            contact.type === 'team_member' && 
                            (contact.phone?.length > 0 || contact.mobile?.length > 0)
                        )
                    );
                    
                    if (hasStructuredData) {
                        this.showBCPDetails(lineId);
                        setTimeout(() => this.showSectionDetails(sectionId), 100);
                        return;
                    }
                }
            }
        }
        
        // Fallback to general search if no structured data found
        this.showAllBFTSections();
    }

    showAllBFTSections() {
        // Search for all BFT sections across all business lines
        document.getElementById('search-input').value = 'business function team';
        document.getElementById('section-filter').value = 'recovery_teams';
        this.performSearch();
    }

    searchForSection(sectionName) {
        // Search for specific section types across all business lines
        document.getElementById('search-input').value = sectionName;
        this.performSearch();
    }

    generateVirtualSectionContent(tocItem, bcpData) {
        const title = tocItem.title.toLowerCase();
        let html = '';

        // Introduction Sections
        if (title.includes('introduction') || title.includes('objective') || title.includes('scope') || title.includes('purpose')) {
            html += `<div class="virtual-section-content">`;
            
            if (title.includes('objective')) {
                html += `<h3>Business Continuity Plan Objective</h3>
                <p>This Business Continuity Plan (BCP) is designed to ensure the continuation of critical business operations during and after a disruptive event. The primary objectives include:</p>
                <ul>
                    <li>Protect the safety and welfare of all employees and stakeholders</li>
                    <li>Minimize business disruption and ensure continuity of essential functions</li>
                    <li>Provide clear guidance for response and recovery procedures</li>
                    <li>Establish communication protocols and contact procedures</li>
                    <li>Define roles and responsibilities during crisis situations</li>
                </ul>`;
            } else if (title.includes('scope')) {
                html += `<h3>Plan Scope</h3>
                <p>This BCP covers the business processes, systems, and personnel within the ${bcpData.title} organization. The scope includes:</p>
                <ul>
                    <li>Critical business functions and their dependencies</li>
                    <li>Recovery time objectives (RTO) and recovery point objectives (RPO)</li>
                    <li>Technology systems and infrastructure requirements</li>
                    <li>Communication and notification procedures</li>
                    <li>Vendor and supplier relationships</li>
                    <li>Personnel and workspace requirements</li>
                </ul>`;
            } else if (title.includes('how to use')) {
                html += `<h3>How to Use This BCP</h3>
                <p>This Business Continuity Plan is organized into several key sections for easy navigation:</p>
                <ol>
                    <li><strong>Quick Activation Guide:</strong> For immediate response during incidents</li>
                    <li><strong>Recovery Teams:</strong> Contact information for Business Function Team (BFT) and Crisis Function Team (CFT)</li>
                    <li><strong>Recovery Procedures:</strong> Step-by-step processes for various scenarios</li>
                    <li><strong>Recovery Strategies:</strong> Business-critical tools and workarounds</li>
                    <li><strong>Dependencies:</strong> Upstream/downstream requirements and vendor information</li>
                </ol>
                <p><strong>💡 Quick Actions:</strong></p>
                <div style="margin: 1rem 0;">
                    <button onclick="window.bcpTracker.searchForSection('activation')" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        🚨 Emergency Activation
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('business function team')" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        📋 Contact BFT
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('recovery strategies')" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        🔧 Recovery Tools
                    </button>
                </div>`;
            } else {
                html += `<h3>Introduction to Business Continuity Planning</h3>
                <p>This section provides an overview of the Business Continuity Plan for ${bcpData.title}. Business continuity planning ensures that essential business functions can continue during and after a crisis or disruption.</p>
                <p><strong>Key Components:</strong></p>
                <ul>
                    <li>Risk assessment and business impact analysis</li>
                    <li>Recovery strategies and procedures</li>
                    <li>Communication plans and contact information</li>
                    <li>Resource requirements and dependencies</li>
                    <li>Testing and maintenance procedures</li>
                </ul>`;
            }
            
            html += `</div>`;
        }
        
        // Activation and Engagement Sections
        else if (title.includes('activation') || title.includes('engagement') || title.includes('when to activate')) {
            html += `<div class="virtual-section-content">
                <h3>Business Continuity Plan Activation</h3>
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4 style="color: #856404; margin-top: 0;">🚨 When to Activate the BCP</h4>
                    <p style="color: #856404;">Activate this Business Continuity Plan when any of the following situations occur:</p>
                    <ul style="color: #856404;">
                        <li>Technology outages affecting critical business systems</li>
                        <li>Building or location unavailability</li>
                        <li>Personnel shortages due to illness, weather, or other factors</li>
                        <li>Vendor or supplier disruptions</li>
                        <li>Network or communication failures</li>
                        <li>Any event that impacts normal business operations</li>
                    </ul>
                </div>
                <h4>Quick Activation Steps</h4>
                <ol>
                    <li><strong>Assess the Situation:</strong> Determine the scope and impact of the incident</li>
                    <li><strong>Contact the BFT:</strong> Notify the Business Function Team immediately</li>
                    <li><strong>Activate Recovery Procedures:</strong> Follow the appropriate recovery strategy</li>
                    <li><strong>Communicate Status:</strong> Keep stakeholders informed of progress</li>
                    <li><strong>Document Actions:</strong> Record all decisions and activities</li>
                </ol>
                <div style="margin: 1rem 0;">
                    <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        📞 Find BFT Contacts
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('crisis communication')" style="background: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        📢 Crisis Communications
                    </button>
                </div>
            </div>`;
        }
        
        // Recovery Teams (BFT/CFT) Sections
        else if (title.includes('recovery team') || title.includes('business function') || title.includes('cross-functional')) {
            html += `<div class="virtual-section-content">
                <h3>Recovery Teams Information</h3>
                <p>Recovery teams are essential for coordinating business continuity efforts during incidents.</p>
                
                <div style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4 style="color: #004085; margin-top: 0;">👥 Team Structure</h4>
                    <ul style="color: #004085;">
                        <li><strong>Business Function Team (BFT):</strong> Primary recovery team for this business line</li>
                        <li><strong>Cross-Functional Team (CFT):</strong> Support team for enterprise-wide coordination</li>
                        <li><strong>Crisis Management Team:</strong> Executive-level oversight and decision making</li>
                    </ul>
                </div>
                
                <h4>Key Responsibilities</h4>
                <ul>
                    <li>Incident assessment and impact analysis</li>
                    <li>Activation of recovery procedures</li>
                    <li>Resource coordination and allocation</li>
                    <li>Stakeholder communication</li>
                    <li>Progress monitoring and reporting</li>
                </ul>
                
                <div style="margin: 1rem 0;">
                    <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        📋 Find All BFT Sections
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('contact')" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        � Search Contact Information
                    </button>
                </div>
            </div>`;
        }
        
        // Crisis Communications
        else if (title.includes('crisis') || title.includes('communication')) {
            html += `<div class="virtual-section-content">
                <h3>Crisis Communications</h3>
                <p>Effective communication is critical during business continuity events. This section outlines communication protocols and procedures.</p>
                
                <h4>Communication Priorities</h4>
                <ol>
                    <li><strong>Employee Safety:</strong> Ensure all personnel are safe and accounted for</li>
                    <li><strong>Internal Notifications:</strong> Alert management and key stakeholders</li>
                    <li><strong>Customer Communications:</strong> Inform customers of service impacts</li>
                    <li><strong>External Updates:</strong> Coordinate with vendors and partners</li>
                </ol>
                
                <div style="background-color: #fff8e7; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0;">
                    <h4>Key Communication Channels</h4>
                    <ul>
                        <li>Cisco e-page system for BFT notifications</li>
                        <li>Email distribution lists for status updates</li>
                        <li>Phone trees for critical notifications</li>
                        <li>Internal portals for ongoing updates</li>
                    </ul>
                </div>
                
                <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    📞 Find Emergency Contacts
                </button>
            </div>`;
        }
        
        // Recovery Strategies
        else if (title.includes('recovery strateg') || title.includes('business critical') || title.includes('workaround')) {
            html += `<div class="virtual-section-content">
                <h3>Recovery Strategies</h3>
                <p>This section outlines strategies and procedures for recovering critical business functions and systems.</p>
                
                <h4>Business Critical Components</h4>
                <ul>
                    <li>Mission-critical applications and systems</li>
                    <li>Essential business processes</li>
                    <li>Key personnel and skill sets</li>
                    <li>Critical data and information</li>
                    <li>Physical infrastructure and equipment</li>
                </ul>
                
                <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4 style="color: #155724; margin-top: 0;">🎯 Recovery Time Objectives (RTO)</h4>
                    <p style="color: #155724;">Recovery strategies are designed to meet specific time objectives:</p>
                    <ul style="color: #155724;">
                        <li><strong>Immediate (0-1 hour):</strong> Critical safety and communication systems</li>
                        <li><strong>Short-term (1-8 hours):</strong> Essential business operations</li>
                        <li><strong>Medium-term (8-24 hours):</strong> Full operational capability</li>
                        <li><strong>Long-term (1-7 days):</strong> Complete system restoration</li>
                    </ul>
                </div>
                
                <button onclick="window.bcpTracker.searchForSection('technology')" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                    💻 Technology Recovery
                </button>
                <button onclick="window.bcpTracker.searchForSection('dependencies')" style="background: #17a2b8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    🔗 View Dependencies
                </button>
            </div>`;
        }
        
        // Dependencies
        else if (title.includes('dependenc') || title.includes('upstream') || title.includes('downstream') || title.includes('vendor') || title.includes('supplier')) {
            html += `<div class="virtual-section-content">
                <h3>Dependencies and Requirements</h3>
                <p>Understanding dependencies is crucial for effective business continuity planning and recovery operations.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 1rem;">
                        <h4 style="color: #856404; margin-top: 0;">⬆️ Upstream Dependencies</h4>
                        <ul style="color: #856404; margin: 0;">
                            <li>Vendor and supplier services</li>
                            <li>Third-party applications</li>
                            <li>Network and infrastructure</li>
                            <li>Data feeds and integrations</li>
                        </ul>
                    </div>
                    <div style="background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 6px; padding: 1rem;">
                        <h4 style="color: #004085; margin-top: 0;">⬇️ Downstream Dependencies</h4>
                        <ul style="color: #004085; margin: 0;">
                            <li>Customer-facing services</li>
                            <li>Internal business processes</li>
                            <li>Reporting and analytics</li>
                            <li>Partner integrations</li>
                        </ul>
                    </div>
                </div>
                
                <h4>Critical Requirements</h4>
                <ul>
                    <li><strong>Personnel:</strong> Key roles and backup staff</li>
                    <li><strong>Technology:</strong> Systems, applications, and infrastructure</li>
                    <li><strong>Facilities:</strong> Workspace and equipment requirements</li>
                    <li><strong>Data:</strong> Critical information and backup procedures</li>
                    <li><strong>Communications:</strong> Contact methods and notification systems</li>
                </ul>
                
                <button onclick="window.bcpTracker.searchForSection('supplier')" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                    🏢 Supplier Info
                </button>
                <button onclick="window.bcpTracker.searchForSection('personnel')" style="background: #fd7e14; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    👥 Personnel Requirements
                </button>
            </div>`;
        }
        
        // Technology/Equipment Sections
        else if (title.includes('technology') || title.includes('equipment') || title.includes('outage') || title.includes('tools')) {
            html += `<div class="virtual-section-content">
                <h3>Technology and Equipment Recovery</h3>
                <p>Technology disruptions can significantly impact business operations. This section provides guidance for various technology-related scenarios.</p>
                
                <div style="background-color: #fee; border: 1px solid #fcc; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4 style="color: #c33; margin-top: 0;">⚠️ Common Technology Disruptions</h4>
                    <ul style="color: #c33;">
                        <li>Network connectivity issues</li>
                        <li>Application or system failures</li>
                        <li>Hardware malfunctions</li>
                        <li>Power outages</li>
                        <li>Security incidents or cyber attacks</li>
                    </ul>
                </div>
                
                <h4>Recovery Procedures</h4>
                <ol>
                    <li><strong>Assess Impact:</strong> Determine affected systems and business processes</li>
                    <li><strong>Implement Workarounds:</strong> Use backup systems or manual processes</li>
                    <li><strong>Escalate to IT:</strong> Engage technical support for resolution</li>
                    <li><strong>Monitor Progress:</strong> Track recovery efforts and communicate status</li>
                    <li><strong>Resume Operations:</strong> Return to normal processes when systems are restored</li>
                </ol>
                
                <button onclick="window.bcpTracker.searchForSection('business critical')" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    🚨 Critical Systems
                </button>
            </div>`;
        }
        
        // Personnel/Staffing Sections
        else if (title.includes('personnel') || title.includes('shortage') || title.includes('staffing') || title.includes('pandemic')) {
            html += `<div class="virtual-section-content">
                <h3>Personnel and Staffing Considerations</h3>
                <p>Personnel availability is crucial for maintaining business operations during disruptions.</p>
                
                <h4>Personnel Shortage Scenarios</h4>
                <ul>
                    <li>Illness or health-related absences</li>
                    <li>Weather-related travel restrictions</li>
                    <li>Pandemic or quarantine situations</li>
                    <li>Emergency evacuations</li>
                    <li>Transportation disruptions</li>
                </ul>
                
                <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4 style="color: #155724; margin-top: 0;">✅ Mitigation Strategies</h4>
                    <ul style="color: #155724;">
                        <li>Cross-training of critical roles</li>
                        <li>Remote work capabilities</li>
                        <li>Flexible scheduling arrangements</li>
                        <li>Backup staffing plans</li>
                        <li>Contractor or temporary staff options</li>
                    </ul>
                </div>
                
                <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    👥 Find Recovery Team
                </button>
            </div>`;
        }
        
        // Building/Location Sections
        else if (title.includes('building') || title.includes('location') || title.includes('facility')) {
            html += `<div class="virtual-section-content">
                <h3>Building and Location Unavailability</h3>
                <p>When primary work locations become unavailable, alternative arrangements must be implemented quickly.</p>
                
                <h4>Common Scenarios</h4>
                <ul>
                    <li>Natural disasters (fire, flood, earthquake)</li>
                    <li>Utility outages (power, water, HVAC)</li>
                    <li>Security incidents or threats</li>
                    <li>Construction or maintenance issues</li>
                    <li>Health and safety concerns</li>
                </ul>
                
                <div style="background-color: #fff8e7; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0;">
                    <h4>Alternative Work Arrangements</h4>
                    <ul>
                        <li><strong>Remote Work:</strong> Enable staff to work from home</li>
                        <li><strong>Alternate Sites:</strong> Use backup office locations</li>
                        <li><strong>Mobile Operations:</strong> Temporary or mobile work spaces</li>
                        <li><strong>Partner Facilities:</strong> Leverage partner or vendor locations</li>
                    </ul>
                </div>
                
                <button onclick="window.bcpTracker.searchForSection('recovery strategies')" style="background: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    🏢 Recovery Options
                </button>
            </div>`;
        }
        
        // Appendix and Directory Sections
        else if (title.includes('appendix') || title.includes('directory') || title.includes('offline')) {
            html += `<div class="virtual-section-content">
                <h3>Reference Information</h3>
                <p>This section contains supplementary information and resources to support business continuity operations.</p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    <h4>Available Resources</h4>
                    <ul>
                        <li><strong>Contact Directory:</strong> Comprehensive contact information for key personnel</li>
                        <li><strong>Recovery Scenarios:</strong> Detailed procedures for specific incident types</li>
                        <li><strong>Template Forms:</strong> Incident reporting and status update templates</li>
                        <li><strong>Vendor Contacts:</strong> Third-party and supplier contact information</li>
                    </ul>
                </div>
                
                <div style="margin: 1rem 0;">
                    <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        📞 Find Emergency Contacts
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('scenarios')" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        📋 Recovery Scenarios
                    </button>
                </div>
            </div>`;
        }
        
        // Default fallback for any unmatched sections
        else {
            html += `<div class="virtual-section-content">
                <h3>${tocItem.title}</h3>
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-left: 4px solid #007acc; padding: 1rem; margin: 1rem 0;">
                    <h4>Section Information</h4>
                    <p>This section contains important business continuity information for ${bcpData.title}. While detailed content extraction is still being processed, this section is part of the comprehensive BCP documentation.</p>
                    
                    <p><strong>Related Resources:</strong></p>
                    <ul>
                        <li>Review the complete table of contents for related sections</li>
                        <li>Use the search function to find specific information</li>
                        <li>Contact the Business Function Team for immediate assistance</li>
                    </ul>
                </div>
                
                <div style="margin: 1rem 0;">
                    <button onclick="window.bcpTracker.showAllBFTSections()" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                        📞 Find Contact Information
                    </button>
                    <button onclick="window.bcpTracker.searchForSection('${title}')" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        🔍 Search "${tocItem.title}"
                    </button>
                </div>
            </div>`;
        }
        
        return html;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, creating BCPTrackerTOC...');
    try {
        window.bcpTracker = new BCPTrackerTOC();
        console.log('BCPTrackerTOC created successfully:', !!window.bcpTracker);
    } catch (error) {
        console.error('Error creating BCPTrackerTOC:', error);
    }
});