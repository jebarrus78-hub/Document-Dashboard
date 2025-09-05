#!/usr/bin/env python3
"""
BCP Dashboard Demo - Shows multiple app capability
This script demonstrates how to run multiple instances for showcasing
"""

import subprocess
import time
import webbrowser
import signal
import sys
from pathlib import Path

def main():
    print("🎯 BCP Document Dashboard - Multi-App Demo")
    print("=" * 50)
    print("This demonstrates running multiple apps simultaneously")
    print("Each app runs on a different port automatically")
    print()
    
    # Start the first instance
    print("🚀 Starting BCP Dashboard Instance 1...")
    process1 = subprocess.Popen([
        sys.executable, 'run_standalone.py', '--no-browser'
    ])
    
    # Wait for startup
    time.sleep(3)
    
    print("✅ Instance 1 running (check http://localhost:5001)")
    print()
    print("You can now:")
    print("• Open another terminal and start more apps")
    print("• Each will automatically find different ports")
    print("• Perfect for showcasing multiple applications!")
    print()
    print("Press Ctrl+C to stop this demo...")
    
    try:
        # Keep running until interrupted
        process1.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping demo...")
        process1.terminate()
        process1.wait()
        print("✅ Demo stopped")

if __name__ == '__main__':
    main()
