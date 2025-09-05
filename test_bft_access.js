// Test script to check if we can access the BFT data directly
function testBFTData() {
    // Test if we can access the global app instance
    if (typeof window.bcpTracker !== 'undefined' && window.bcpTracker.bcpData) {
        console.log('App found, testing BFT access...');
        
        const cxTacData = window.bcpTracker.bcpData['cx-tac'];
        if (cxTacData) {
            console.log('CX-TAC data found');
            
            const bftSection = cxTacData.sections['business_function_team_bft'];
            if (bftSection) {
                console.log('BFT section found:', bftSection.type);
                console.log('Content items:', bftSection.content.length);
                
                const contactsItems = bftSection.content.filter(item => item.type === 'contacts');
                console.log('Contacts items:', contactsItems.length);
                
                if (contactsItems.length > 0) {
                    const contactsItem = contactsItems[0];
                    console.log('First contacts item has', contactsItem.content.length, 'contacts');
                    
                    const teamMembers = contactsItem.content.filter(c => c.type === 'team_member');
                    console.log('Team members:', teamMembers.length);
                    
                    if (teamMembers.length > 0) {
                        console.log('First team member:', teamMembers[0].name);
                    }
                    
                    // Test the detection logic
                    const hasBFTData = contactsItem.content.some(contact => 
                        contact.type === 'team_member' && 
                        (contact.phone?.length > 0 || contact.mobile?.length > 0)
                    );
                    console.log('BFT detection result:', hasBFTData);
                    
                    // Test the rendering
                    const renderedHTML = window.bcpTracker.formatContactsList(contactsItem);
                    console.log('Rendered HTML length:', renderedHTML.length);
                    console.log('Contains table:', renderedHTML.includes('<table'));
                }
            } else {
                console.log('BFT section not found');
            }
        } else {
            console.log('CX-TAC data not found');
        }
    } else {
        console.log('App not found or no bcpData');
    }
}

// Call the test
testBFTData();
