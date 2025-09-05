// Debug script to check BFT data structure
const fs = require('fs');

async function debugBFTData() {
    try {
        const fileContent = fs.readFileSync('bcp-data-final.json', 'utf8');
        const data = JSON.parse(fileContent);
        const cxTacPlan = data.bcpPlans['cx-tac'];
        
        console.log('CX-TAC Plan loaded:', !!cxTacPlan);
        
        if (cxTacPlan && cxTacPlan.sections) {
            console.log('Available sections:', Object.keys(cxTacPlan.sections));
            
            const bftSection = cxTacPlan.sections['business_function_team_bft'];
            console.log('BFT Section exists:', !!bftSection);
            
            if (bftSection) {
                console.log('BFT Section type:', bftSection.type);
                console.log('BFT Section content length:', bftSection.content?.length);
                
                // Check for contacts items
                const contactsItems = bftSection.content?.filter(item => item.type === 'contacts') || [];
                console.log('Contacts items found:', contactsItems.length);
                
                contactsItems.forEach((item, index) => {
                    console.log(`Contacts item ${index}:`, {
                        type: item.type,
                        contentLength: item.content?.length,
                        hasTeamMembers: item.content?.some(c => c.type === 'team_member')
                    });
                    
                    if (item.content) {
                        const teamMembers = item.content.filter(c => c.type === 'team_member');
                        console.log(`  Team members: ${teamMembers.length}`);
                        
                        // Check BFT detection logic
                        const hasBFTData = item.content.some(contact => 
                            contact.type === 'team_member' && 
                            (contact.phone?.length > 0 || contact.mobile?.length > 0)
                        );
                        console.log(`  Has BFT data: ${hasBFTData}`);
                        
                        if (teamMembers.length > 0) {
                            const firstMember = teamMembers[0];
                            console.log(`  First member:`, {
                                name: firstMember.name,
                                hasPhone: firstMember.phone?.length > 0,
                                hasMobile: firstMember.mobile?.length > 0
                            });
                        }
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugBFTData();
