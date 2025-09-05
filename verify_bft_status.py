#!/usr/bin/env python3
"""
Script to verify the current BFT status across all business lines.
"""

import json
import sys

def verify_bft_status():
    """Verify BFT sections across all business lines."""
    
    try:
        with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: bcp-data-final.json not found")
        return False
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return False
    
    print("🔍 Verifying BFT Status Across All Business Lines")
    print("=" * 60)
    
    bcp_plans = data.get('bcpPlans', {})
    if not bcp_plans:
        print("❌ No BCP plans found in data")
        return False
    
    total_lines = len(bcp_plans)
    lines_with_bft = 0
    lines_with_structured_bft = 0
    
    for line_id, plan in bcp_plans.items():
        print(f"\n📋 {plan.get('title', line_id)} ({line_id})")
        
        # Check for BFT section in TOC
        toc = plan.get('tableOfContents', [])
        bft_in_toc = any('business function team' in item.get('title', '').lower() for item in toc)
        
        if bft_in_toc:
            print("  ✅ BFT section found in TOC")
        else:
            print("  ⚠️  No BFT section in TOC")
            continue
        
        # Check for BFT section content
        sections = plan.get('sections', {})
        bft_section = None
        
        for section_id, section in sections.items():
            if 'business_function_team' in section_id.lower() or 'bft' in section_id.lower():
                bft_section = section
                break
        
        if not bft_section:
            print("  ❌ No BFT section content found")
            continue
        
        lines_with_bft += 1
        print("  ✅ BFT section content found")
        
        # Check for structured contact data
        content = bft_section.get('content', [])
        structured_contacts = []
        
        for item in content:
            if item.get('type') == 'contacts' and item.get('title') == 'Business Function Team Members':
                contacts = item.get('content', [])
                structured_contacts = [c for c in contacts if c.get('type') == 'team_member']
                break
        
        if structured_contacts:
            lines_with_structured_bft += 1
            print(f"  ✅ Structured BFT contacts found: {len(structured_contacts)} members")
            
            # Show a few sample contacts
            sample_contacts = structured_contacts[:3]
            for contact in sample_contacts:
                name = contact.get('name', 'Unknown')
                title = contact.get('title', 'No title')
                phone = contact.get('phone', [''])[0] if contact.get('phone') else ''
                print(f"    • {name} - {title} - {phone}")
            
            if len(structured_contacts) > 3:
                print(f"    ... and {len(structured_contacts) - 3} more")
        else:
            print("  ❌ No structured BFT contacts found")
            
            # Check for any content
            text_content = ""
            for item in content:
                if isinstance(item.get('content'), str):
                    text_content += item['content']
            
            if text_content:
                print(f"  📝 Found text content ({len(text_content)} chars)")
            else:
                print("  ❌ No content at all")
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY:")
    print(f"  Total business lines: {total_lines}")
    print(f"  Lines with BFT sections: {lines_with_bft}")
    print(f"  Lines with structured BFT contacts: {lines_with_structured_bft}")
    
    if lines_with_structured_bft == total_lines:
        print("  🎉 ALL business lines have structured BFT contacts!")
        return True
    elif lines_with_structured_bft == 0:
        print("  ❌ NO business lines have structured BFT contacts!")
        return False
    else:
        missing = total_lines - lines_with_structured_bft
        print(f"  ⚠️  {missing} business lines missing structured BFT contacts")
        return False

if __name__ == "__main__":
    success = verify_bft_status()
    sys.exit(0 if success else 1)
