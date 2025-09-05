#!/usr/bin/env python3
"""
BCP Document Dashboard - Standalone Runner
Runs the Flask app without requiring VS Code or external dependencies
"""

import os
import sys
import subprocess
import platform
import webbrowser
import time
import signal
from pathlib import Path

class BCPDashboardRunner:
    def __init__(self):
        self.base_dir = Path(__file__).parent.absolute()
        self.venv_dir = self.base_dir / '.venv'
        self.requirements_file = self.base_dir / 'requirements_flask.txt'
        self.app_file = self.base_dir / 'app.py'
        self.port = 5001  # Using 5001 to avoid conflicts
        
    def check_python_version(self):
        """Check if Python 3.8+ is available"""
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print(f"❌ Python {version.major}.{version.minor} detected. Python 3.8+ required.")
            return False
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    
    def create_virtual_environment(self):
        """Create virtual environment if it doesn't exist"""
        if self.venv_dir.exists():
            print("✅ Virtual environment already exists")
            return True
            
        print("🔧 Creating virtual environment...")
        try:
            subprocess.run([sys.executable, '-m', 'venv', str(self.venv_dir)], 
                         check=True, capture_output=True)
            print("✅ Virtual environment created")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    
    def get_python_executable(self):
        """Get the Python executable path for the virtual environment"""
        if platform.system() == 'Windows':
            return self.venv_dir / 'Scripts' / 'python.exe'
        else:
            return self.venv_dir / 'bin' / 'python'
    
    def install_requirements(self):
        """Install required packages"""
        python_exe = self.get_python_executable()
        
        if not python_exe.exists():
            print("❌ Python executable not found in virtual environment")
            return False
            
        print("📦 Installing requirements...")
        try:
            subprocess.run([
                str(python_exe), '-m', 'pip', 'install', 
                '--upgrade', 'pip'
            ], check=True, capture_output=True)
            
            if self.requirements_file.exists():
                subprocess.run([
                    str(python_exe), '-m', 'pip', 'install', 
                    '-r', str(self.requirements_file)
                ], check=True, capture_output=True)
            else:
                # Install essential packages directly
                packages = ['flask>=3.0.0', 'python-docx>=1.1.0', 'jinja2>=3.1.0']
                subprocess.run([
                    str(python_exe), '-m', 'pip', 'install'
                ] + packages, check=True, capture_output=True)
            
            print("✅ Requirements installed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install requirements: {e}")
            return False
    
    def is_port_available(self, port):
        """Check if a port is available"""
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return True
            except OSError:
                return False
    
    def find_available_port(self, start_port=5001):
        """Find an available port starting from start_port"""
        port = start_port
        while port < start_port + 100:  # Try 100 ports
            if self.is_port_available(port):
                return port
            port += 1
        return None
    
    def run_app(self, open_browser=True):
        """Run the Flask application"""
        python_exe = self.get_python_executable()
        
        if not python_exe.exists():
            print("❌ Python executable not found")
            return False
        
        if not self.app_file.exists():
            print("❌ app.py not found")
            return False
        
        # Find available port
        available_port = self.find_available_port(self.port)
        if not available_port:
            print("❌ No available ports found")
            return False
        
        print(f"🚀 Starting BCP Document Dashboard on port {available_port}")
        print(f"📂 Working directory: {self.base_dir}")
        print(f"🌐 URL: http://localhost:{available_port}")
        print("Press Ctrl+C to stop the server")
        print("-" * 50)
        
        try:
            # Set environment variables
            env = os.environ.copy()
            env['FLASK_APP'] = str(self.app_file)
            env['FLASK_ENV'] = 'production'  # Use production for standalone
            
            # Create the process
            process = subprocess.Popen([
                str(python_exe), str(self.app_file)
            ], cwd=str(self.base_dir), env=env)
            
            # Wait a moment for the server to start
            time.sleep(3)
            
            # Open browser if requested
            if open_browser:
                url = f"http://localhost:{available_port}"
                print(f"🌐 Opening browser to {url}")
                webbrowser.open(url)
            
            # Wait for the process to complete
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Shutting down server...")
                process.terminate()
                process.wait()
                print("✅ Server stopped")
                return True
            
        except Exception as e:
            print(f"❌ Error running application: {e}")
            return False
    
    def setup_and_run(self, open_browser=True):
        """Complete setup and run process"""
        print("=" * 60)
        print("🏥 BCP Document Dashboard - Standalone Runner")
        print("=" * 60)
        
        if not self.check_python_version():
            return False
        
        if not self.create_virtual_environment():
            return False
        
        if not self.install_requirements():
            return False
        
        return self.run_app(open_browser)

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='BCP Document Dashboard Standalone Runner')
    parser.add_argument('--no-browser', action='store_true', 
                       help='Do not open browser automatically')
    
    args = parser.parse_args()
    
    runner = BCPDashboardRunner()
    success = runner.setup_and_run(open_browser=not args.no_browser)
    
    if not success:
        print("\n❌ Failed to start application")
        sys.exit(1)

if __name__ == '__main__':
    main()
