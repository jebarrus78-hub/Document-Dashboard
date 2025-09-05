#!/usr/bin/env python3
"""
Test script to verify that BFT tables are being displayed properly in the web application.
"""

import json
import os

def test_bft_ui_functionality():
    """Test BFT UI functionality across business lines."""
    
    print("🧪 Testing BFT UI Functionality")
    print("=" * 50)
    
    # Check if required files exist
    required_files = ['index.html', 'script-toc.js', 'styles.css', 'bcp-data-final.json']
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            return False
    
    # Check script-toc.js for BFT rendering function
    print("\n🔍 Checking JavaScript functions...")
    try:
        with open('script-toc.js', 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        required_functions = [
            'formatBFTTable',
            'formatContactsList',
            'navigateToBFT'
        ]
        
        for func in required_functions:
            if func in js_content:
                print(f"✅ {func} function found")
            else:
                print(f"❌ {func} function missing")
        
        # Check for BFT-specific rendering logic
        if 'bft-contacts-table' in js_content:
            print("✅ BFT table CSS class found")
        else:
            print("❌ BFT table CSS class missing")
    
    except Exception as e:
        print(f"❌ Error reading script-toc.js: {e}")
        return False
    
    # Check styles.css for BFT styles
    print("\n🎨 Checking CSS styles...")
    try:
        with open('styles.css', 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        bft_styles = [
            'bft-table-container',
            'bft-contacts-table',
            'team-member'
        ]
        
        for style in bft_styles:
            if style in css_content:
                print(f"✅ {style} style found")
            else:
                print(f"⚠️  {style} style not found (may use default)")
    
    except Exception as e:
        print(f"❌ Error reading styles.css: {e}")
        return False
    
    # Test data accessibility
    print("\n📊 Testing data accessibility...")
    try:
        with open('bcp-data-final.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        bcp_plans = data.get('bcpPlans', {})
        
        for line_id, plan in bcp_plans.items():
            plan_title = plan.get('title', line_id)
            
            # Find BFT section
            sections = plan.get('sections', {})
            bft_section = None
            
            for section_id, section in sections.items():
                if 'business_function_team' in section_id.lower():
                    bft_section = section
                    break
            
            if bft_section:
                # Check for structured contacts
                content = bft_section.get('content', [])
                contacts_item = None
                
                for item in content:
                    if (item.get('type') == 'contacts' and 
                        item.get('title') == 'Business Function Team Members'):
                        contacts_item = item
                        break
                
                if contacts_item:
                    contacts = contacts_item.get('content', [])
                    team_members = [c for c in contacts if c.get('type') == 'team_member']
                    
                    if team_members:
                        print(f"✅ {plan_title}: {len(team_members)} BFT contacts ready for display")
                    else:
                        print(f"❌ {plan_title}: No team members found")
                else:
                    print(f"❌ {plan_title}: No contacts structure found")
            else:
                print(f"⚠️  {plan_title}: No BFT section (expected for LSC)")
    
    except Exception as e:
        print(f"❌ Error testing data: {e}")
        return False
    
    print("\n✅ BFT UI functionality test completed!")
    print("\n📝 To verify visual display:")
    print("1. Open index.html in a browser")
    print("2. Select any business line (except LSC)")
    print("3. Navigate to 'Business Function Team (BFT)' section")
    print("4. Verify the contact table displays with proper formatting")
    
    return True

if __name__ == "__main__":
    test_bft_ui_functionality()
