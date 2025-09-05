#!/usr/bin/env python3
"""
Verify the distinct BFT contacts are properly loaded and show actual contact names
"""

import json

def verify_distinct_contacts():
    """Verify distinct BFT contacts across all business lines."""
    
    try:
        with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: bcp-data-final.json not found")
        return False
    
    print("🔍 Verifying Distinct BFT Contacts")
    print("=" * 50)
    
    bcp_plans = data.get('bcpPlans', {})
    
    for line_id, plan in bcp_plans.items():
        print(f"\n📋 {plan.get('title', line_id)} ({line_id})")
        
        # Find BFT section
        sections = plan.get('sections', {})
        bft_section = None
        
        for section_id, section in sections.items():
            if 'recovery' in section_id.lower() or 'bft' in section_id.lower():
                bft_section = section
                break
        
        if not bft_section:
            print("  ❌ No BFT/Recovery section found")
            continue
        
        print(f"  ✅ Found BFT section: {bft_section.get('title', 'Unknown')}")
        
        # Look for contacts in the section
        content = bft_section.get('content', [])
        contacts_found = []
        
        def find_contacts_recursive(items):
            for item in items:
                if isinstance(item, dict):
                    if item.get('type') == 'contacts':
                        contact_list = item.get('content', [])
                        for contact in contact_list:
                            if contact.get('type') == 'team_member':
                                contacts_found.append(contact)
                    elif item.get('content') and isinstance(item.get('content'), list):
                        find_contacts_recursive(item['content'])
        
        find_contacts_recursive(content)
        
        if contacts_found:
            print(f"  ✅ Found {len(contacts_found)} distinct contacts:")
            
            # Show first 5 contacts
            for i, contact in enumerate(contacts_found[:5]):
                name = contact.get('name', 'Unknown')
                title = contact.get('title', 'No title')
                phone = contact.get('phone', ['No phone'])[0] if contact.get('phone') else 'No phone'
                print(f"    {i+1}. {name} - {title} - {phone}")
            
            if len(contacts_found) > 5:
                print(f"    ... and {len(contacts_found) - 5} more")
            
            # Check if these are unique contacts
            names = [c.get('name', '') for c in contacts_found]
            unique_names = set(names)
            if len(unique_names) == len(names):
                print("  ✅ All contacts have unique names")
            else:
                print("  ⚠️  Some duplicate names found")
        else:
            print("  ❌ No contacts found in BFT section")

def compare_business_lines():
    """Compare contacts across business lines to verify they are distinct."""
    
    try:
        with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: bcp-data-final.json not found")
        return False
    
    print("\n" + "=" * 50)
    print("🔍 Comparing Contacts Across Business Lines")
    print("=" * 50)
    
    bcp_plans = data.get('bcpPlans', {})
    all_contacts_by_line = {}
    
    # Extract contacts from each business line
    for line_id, plan in bcp_plans.items():
        contacts = []
        sections = plan.get('sections', {})
        
        for section_id, section in sections.items():
            if 'recovery' in section_id.lower() or 'bft' in section_id.lower():
                content = section.get('content', [])
                
                def extract_contacts_recursive(items):
                    for item in items:
                        if isinstance(item, dict):
                            if item.get('type') == 'contacts':
                                contact_list = item.get('content', [])
                                for contact in contact_list:
                                    if contact.get('type') == 'team_member':
                                        contacts.append(contact.get('name', 'Unknown'))
                            elif item.get('content') and isinstance(item.get('content'), list):
                                extract_contacts_recursive(item['content'])
                
                extract_contacts_recursive(content)
                break
        
        all_contacts_by_line[line_id] = contacts
    
    # Compare contacts
    print(f"\n📊 Contact Comparison Summary:")
    for line_id, contacts in all_contacts_by_line.items():
        print(f"  {line_id}: {len(contacts)} contacts")
        if contacts:
            print(f"    First 3: {', '.join(contacts[:3])}")
    
    # Check for distinctness
    print(f"\n🔍 Distinctness Check:")
    line_ids = list(all_contacts_by_line.keys())
    
    for i in range(len(line_ids)):
        for j in range(i + 1, len(line_ids)):
            line1, line2 = line_ids[i], line_ids[j]
            contacts1 = set(all_contacts_by_line[line1])
            contacts2 = set(all_contacts_by_line[line2])
            
            overlap = contacts1.intersection(contacts2)
            if overlap:
                print(f"  ⚠️  {line1} and {line2} share {len(overlap)} contacts")
                if len(overlap) <= 3:
                    print(f"    Shared: {', '.join(list(overlap))}")
            else:
                print(f"  ✅ {line1} and {line2} have completely distinct contacts")

if __name__ == "__main__":
    verify_distinct_contacts()
    compare_business_lines()
