#!/usr/bin/env python3
"""
Test script to check CX-TAC BFT section content
"""

import json

def check_cx_tac_sections():
    with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'cx-tac' not in data['bcpPlans']:
        print("❌ CX-TAC plan not found")
        return
    
    cx_tac = data['bcpPlans']['cx-tac']
    print(f"✅ CX-TAC plan found: {cx_tac['title']}")
    print(f"📋 Sections count: {len(cx_tac.get('sections', {}))}")
    
    sections = cx_tac.get('sections', {})
    for key, section in sections.items():
        print(f"\n📄 Section: {key}")
        print(f"   Title: {section.get('title', 'N/A')}")
        print(f"   Type: {section.get('type', 'N/A')}")
        
        content = section.get('content', [])
        print(f"   Content items: {len(content)}")
        
        if key == 'business_function_team_bft':
            print("   🎯 This is the BFT section!")
            for i, item in enumerate(content):
                print(f"      Item {i}: type={item.get('type', 'N/A')}")
                if item.get('type') == 'contacts' and 'content' in item:
                    contacts = item['content']
                    print(f"         Contacts count: {len(contacts)}")
                    if contacts:
                        print(f"         First contact: {contacts[0].get('name', 'N/A')}")
        
        if key == 'cross_functional_team_cft':
            print("   🎯 This is the CFT section!")
            for i, item in enumerate(content):
                print(f"      Item {i}: type={item.get('type', 'N/A')}")

if __name__ == "__main__":
    check_cx_tac_sections()
