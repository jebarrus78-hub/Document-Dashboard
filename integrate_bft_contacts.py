#!/usr/bin/env python3
"""
BCP BFT Contact Integration Script
Takes the existing BCP data and adds structured BFT contact tables to all business lines
using the contact format from the TAC table analysis.
"""

import json
import re
from datetime import datetime

def load_bcp_data():
    """Load the current BCP data"""
    with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_tac_contacts():
    """Load the TAC BFT contacts from table analysis"""
    with open('tac_table_analysis.json', 'r', encoding='utf-8') as f:
        tac_data = json.load(f)
    
    # Find the BFT contact table (Table 3)
    for table in tac_data.get('tac', {}).get('contact_tables', []):
        if (table.get('analysis', {}).get('likely_contact_type') == 'BFT' and 
            table.get('table_index') == 3):
            
            print(f"Found BFT contact table with {len(table.get('data', [])) - 1} contacts")
            return table.get('data', [])
    
    return []

def parse_contact_row(row):
    """Parse a contact row into structured format"""
    if len(row) < 3:
        return None
        
    name_field = row[0].strip()
    title = row[1].strip() if len(row) > 1 else ""
    location = row[2].strip() if len(row) > 2 else ""
    phone = row[3].strip() if len(row) > 3 else ""
    mobile = row[4].strip() if len(row) > 4 else ""
    
    # Extract name and userid
    name = name_field
    userid = ""
    if '(' in name_field and ')' in name_field:
        match = re.search(r'(.+?)\s*\((.+?)\)', name_field)
        if match:
            name = match.group(1).strip()
            userid = match.group(2).strip()
    
    # Clean phone numbers
    def clean_phone(phone_str):
        if not phone_str or phone_str in ['', 'N/A', '-']:
            return []
        # Split by commas or newlines and clean
        phones = re.split(r'[,\n]', phone_str)
        cleaned = []
        for p in phones:
            p = p.strip()
            if p and not p.lower().startswith('email'):
                # Remove extra text, keep just the number
                phone_match = re.search(r'[\+\d][\d\s\-\(\)\.]+\d', p)
                if phone_match:
                    cleaned.append(phone_match.group().strip())
        return cleaned
    
    phone_numbers = clean_phone(phone)
    mobile_numbers = clean_phone(mobile)
    
    return {
        "type": "team_member",
        "name": name,
        "userid": userid,
        "raw_name": name_field,
        "title": title,
        "location": location,
        "phone": phone_numbers,
        "mobile": mobile_numbers,
        "email": [],
        "description": ""
    }

def create_bft_contacts_section(contacts_data):
    """Create a structured BFT contacts section"""
    if not contacts_data or len(contacts_data) < 2:
        return []
    
    # Parse header row
    headers = contacts_data[0]
    print(f"BFT table headers: {headers}")
    
    # Parse contact rows
    contacts = []
    for row in contacts_data[1:]:
        contact = parse_contact_row(row)
        if contact and contact['name'] and len(contact['name']) > 2:
            contacts.append(contact)
    
    print(f"Parsed {len(contacts)} valid BFT contacts")
    
    # Create the contacts section
    return [{
        "type": "contacts",
        "title": "Business Function Team Members",
        "content": contacts
    }]

def add_bft_to_business_line(plan_data, bft_contacts_content):
    """Add BFT contacts to a business line plan"""
    # Find the BFT section
    bft_section_key = None
    for section_key, section in plan_data.get('sections', {}).items():
        if ('bft' in section_key.lower() or 
            'business function' in section.get('title', '').lower()):
            bft_section_key = section_key
            break
    
    if bft_section_key:
        # Replace the content with structured contacts
        plan_data['sections'][bft_section_key]['content'] = bft_contacts_content
        print(f"  ✅ Updated BFT section: {plan_data['sections'][bft_section_key]['title']}")
        return True
    
    return False

def main():
    print("🔄 BCP BFT Contact Integration")
    print("=" * 50)
    
    # Load data
    print("📁 Loading BCP data...")
    bcp_data = load_bcp_data()
    
    print("📞 Loading TAC BFT contacts...")
    tac_contacts = load_tac_contacts()
    
    if not tac_contacts:
        print("❌ No TAC BFT contacts found!")
        return
    
    # Create structured BFT content
    print("🏗️ Creating structured BFT contacts...")
    bft_content = create_bft_contacts_section(tac_contacts)
    
    if not bft_content:
        print("❌ Failed to create BFT content!")
        return
    
    # Apply to all business lines
    print("\\n📋 Applying BFT contacts to all business lines:")
    updated_count = 0
    
    for line_id, plan in bcp_data['bcpPlans'].items():
        print(f"\\n📄 {plan['title']} ({line_id}):")
        
        if add_bft_to_business_line(plan, bft_content):
            updated_count += 1
        else:
            print("  ⚠️ No BFT section found - adding virtual content note")
    
    # Save updated data
    output_file = 'bcp-data-final.json'
    print(f"\\n💾 Saving updated BCP data to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(bcp_data, f, indent=2, ensure_ascii=False)
    
    print(f"\\n✅ BFT Integration Complete!")
    print(f"📊 Summary:")
    print(f"  - Business lines updated: {updated_count}")
    print(f"  - BFT contacts per line: {len(bft_content[0]['content']) if bft_content else 0}")
    print(f"  - Total BFT entries created: {updated_count * len(bft_content[0]['content']) if bft_content else 0}")

if __name__ == "__main__":
    main()
