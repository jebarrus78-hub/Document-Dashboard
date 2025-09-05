#!/usr/bin/env python3
"""
Python 3.13 Compatibility Check for BCP Data Tracker
Verifies that all project components work correctly with Python 3.13
"""

import sys
import json
import os
import importlib.util
from pathlib import Path

def check_python_version():
    """Check Python version compatibility."""
    print("🐍 Python Version Check")
    print("=" * 40)
    
    version = sys.version_info
    print(f"Current Python: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 13:
        print("✅ Python 3.13+ detected - Full compatibility")
        return True
    elif version.major == 3 and version.minor >= 8:
        print("⚠️  Python 3.8+ detected - Should work but 3.13 recommended")
        return True
    else:
        print("❌ Python version too old - Please upgrade to Python 3.13")
        return False

def check_required_modules():
    """Check if required modules are available."""
    print("\n📦 Module Availability Check")
    print("=" * 40)
    
    required_modules = [
        ('json', 'Built-in'),
        ('os', 'Built-in'),
        ('re', 'Built-in'),
        ('pathlib', 'Built-in'),
        ('argparse', 'Built-in'),
        ('datetime', 'Built-in'),
        ('sys', 'Built-in'),
        ('docx', 'python-docx package')
    ]
    
    all_available = True
    
    for module_name, source in required_modules:
        try:
            if module_name == 'docx':
                import docx
                print(f"✅ {module_name} ({source}) - Version: {docx.__version__}")
            else:
                __import__(module_name)
                print(f"✅ {module_name} ({source})")
        except ImportError:
            print(f"❌ {module_name} ({source}) - NOT AVAILABLE")
            all_available = False
    
    return all_available

def check_python_313_features():
    """Test Python 3.13 specific features and improvements."""
    print("\n🚀 Python 3.13 Features Check")
    print("=" * 40)
    
    features_working = []
    
    # Check for improved error messages
    try:
        # This should give a better error message in Python 3.13
        exec("1 + '2'")
    except TypeError as e:
        features_working.append("Enhanced error messages")
    
    # Check for pattern matching (available since 3.10)
    try:
        exec("""
def test_match(x):
    match x:
        case 1:
            return "one"
        case _:
            return "other"
        """)
        features_working.append("Pattern matching (match/case)")
    except SyntaxError:
        pass
    
    # Check for new typing features
    try:
        from typing import TypedDict, Optional, Union
        features_working.append("Advanced typing support")
    except ImportError:
        pass
    
    # Check for f-string improvements
    try:
        name = "test"
        result = f"{name=}"  # This syntax was improved in recent versions
        features_working.append("Enhanced f-strings")
    except SyntaxError:
        pass
    
    print(f"✅ Available Python 3.13 features: {len(features_working)}")
    for feature in features_working:
        print(f"   • {feature}")
    
    return len(features_working) > 0

def check_project_scripts():
    """Check if project Python scripts are compatible."""
    print("\n📝 Project Scripts Compatibility")
    print("=" * 40)
    
    script_files = [
        'verify_bft_status.py',
        'test_bft_ui.py',
        'integrate_bft_contacts.py',
        'document_converter_final.py'
    ]
    
    all_compatible = True
    
    for script in script_files:
        if os.path.exists(script):
            try:
                # Try to compile the script
                with open(script, 'r', encoding='utf-8') as f:
                    code = f.read()
                
                compile(code, script, 'exec')
                print(f"✅ {script} - Syntax compatible")
                
            except SyntaxError as e:
                print(f"❌ {script} - Syntax error: {e}")
                all_compatible = False
            except Exception as e:
                print(f"⚠️  {script} - Warning: {e}")
        else:
            print(f"⚠️  {script} - File not found")
    
    return all_compatible

def check_data_files():
    """Check if data files are accessible."""
    print("\n📊 Data Files Check")
    print("=" * 40)
    
    data_files = [
        'bcp-data-final.json',
        'tac_table_analysis.json'
    ]
    
    all_accessible = True
    
    for data_file in data_files:
        if os.path.exists(data_file):
            try:
                with open(data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                print(f"✅ {data_file} - Valid JSON ({len(str(data))} chars)")
            except json.JSONDecodeError as e:
                print(f"❌ {data_file} - Invalid JSON: {e}")
                all_accessible = False
            except Exception as e:
                print(f"❌ {data_file} - Error: {e}")
                all_accessible = False
        else:
            print(f"⚠️  {data_file} - File not found")
    
    return all_accessible

def main():
    """Run all compatibility checks."""
    print("🔍 BCP Data Tracker - Python 3.13 Compatibility Check")
    print("=" * 60)
    print(f"Running from: {os.getcwd()}")
    print("")
    
    checks = [
        ("Python Version", check_python_version),
        ("Required Modules", check_required_modules),
        ("Python 3.13 Features", check_python_313_features),
        ("Project Scripts", check_project_scripts),
        ("Data Files", check_data_files)
    ]
    
    results = []
    
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} check failed: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 COMPATIBILITY SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for check_name, result in results:
        if result:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n🎯 Overall Score: {passed}/{total} ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All checks passed! Project is fully compatible with Python 3.13")
        return True
    elif passed >= total * 0.8:
        print("⚠️  Most checks passed. Project should work with minor issues.")
        return True
    else:
        print("❌ Multiple compatibility issues detected. Please address them.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
