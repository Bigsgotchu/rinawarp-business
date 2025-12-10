#!/usr/bin/env python3
"""
Comprehensive RinaWarp Applications Test
Tests for JavaScript errors, CSS issues, and functionality
"""
import os
import re
from pathlib import Path

def analyze_html_file(filepath):
    """Analyze an HTML file for issues"""
    print(f"\n🔍 Analyzing: {filepath}")
    print("=" * 60)
    
    if not os.path.exists(filepath):
        print("❌ FILE NOT FOUND!")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check basic HTML structure
    issues = []
    warnings = []
    
    # Check for DOCTYPE
    if '<!DOCTYPE html>' not in content:
        issues.append("Missing DOCTYPE declaration")
    
    # Check for viewport meta tag
    if 'viewport' not in content:
        warnings.append("Missing viewport meta tag (responsive design)")
    
    # Check for charset
    if 'charset' not in content:
        warnings.append("Missing charset declaration")
    
    # Check for title
    if '<title>' not in content:
        issues.append("Missing title tag")
    
    # Check for CSS
    if '<style>' not in content and 'css' not in content.lower():
        warnings.append("No inline CSS found")
    
    # Check for JavaScript
    if '<script>' not in content:
        issues.append("No JavaScript found")
    
    # Check for body tag
    if '<body>' not in content:
        issues.append("Missing body tag")
    
    # Check for id attributes (common in dynamic apps)
    if 'id=' not in content:
        warnings.append("No element IDs found (may be static app)")
    
    # Check for onclick handlers (common in demos)
    if 'onclick=' not in content:
        warnings.append("No click handlers found (may not be interactive)")
    
    # Analyze JavaScript issues
    js_issues = check_javascript_issues(content)
    issues.extend(js_issues)
    
    # Check CSS issues
    css_issues = check_css_issues(content)
    issues.extend(css_issues)
    
    # Report results
    if issues:
        print("❌ CRITICAL ISSUES FOUND:")
        for issue in issues:
            print(f"   • {issue}")
    else:
        print("✅ No critical issues found")
    
    if warnings:
        print("⚠️  WARNINGS:")
        for warning in warnings:
            print(f"   • {warning}")
    
    return len(issues) == 0

def check_javascript_issues(content):
    """Check for common JavaScript issues"""
    issues = []
    js_blocks = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
    
    if not js_blocks:
        return ["No JavaScript blocks found"]
    
    for i, js in enumerate(js_blocks):
        # Check for common errors
        if 'getElementById' in js and 'document.getElementById' not in js:
            issues.append(f"JavaScript block {i+1}: Incomplete getElementById usage")
        
        if 'addEventListener' in js and 'element.addEventListener' not in js:
            issues.append(f"JavaScript block {i+1}: Incomplete addEventListener usage")
        
        # Check for console.log (should be fine, just checking)
        if 'console.log' not in js:
            issues.append(f"JavaScript block {i+1}: No debugging output")
        
        # Check for syntax issues
        if js.count('{') != js.count('}'):
            issues.append(f"JavaScript block {i+1}: Mismatched braces")
        
        if js.count('(') != js.count(')'):
            issues.append(f"JavaScript block {i+1}: Mismatched parentheses")
        
        # Check for missing semicolons (potential issue)
        lines = js.strip().split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if line and not line.endswith((';', '{', '}', '//', '/*')) and '=' in line:
                # This might be a statement missing semicolon
                issues.append(f"JavaScript block {i+1}, line {line_num}: Possible missing semicolon")
    
    return issues

def check_css_issues(content):
    """Check for common CSS issues"""
    issues = []
    css_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    if not css_blocks:
        return ["No CSS blocks found"]
    
    for i, css in enumerate(css_blocks):
        # Check for unclosed properties
        lines = css.split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if line and not line.startswith('/*') and not line.endswith(('}', '*/')):
                if ':' in line and not line.endswith(';'):
                    issues.append(f"CSS block {i+1}, line {line_num}: Missing semicolon")
    
    return issues

def test_launch_script():
    """Test the launch script"""
    print("\n🚀 Testing Launch Script")
    print("=" * 60)
    
    script_path = "launch-rinawarp-suite.sh"
    if not os.path.exists(script_path):
        print("❌ Launch script not found!")
        return False
    
    with open(script_path, 'r') as f:
        content = f.read()
    
    issues = []
    
    # Check for proper shebang
    if not content.startswith('#!/usr/bin/env bash'):
        issues.append("Missing proper shebang")
    
    # Check for executable permissions (we can't check this easily)
    
    # Check for proper syntax
    if 'xdg-open' not in content:
        issues.append("No xdg-open command found")
    
    if '$HOME/Documents/Rinawarp-Platforms' not in content:
        issues.append("Hardcoded path may not be correct")
    
    if issues:
        print("❌ LAUNCH SCRIPT ISSUES:")
        for issue in issues:
            print(f"   • {issue}")
        return False
    else:
        print("✅ Launch script looks correct")
        return True

def generate_fix_report():
    """Generate a comprehensive fix report"""
    print("\n💡 DETAILED FIX RECOMMENDATIONS")
    print("=" * 60)
    
    print("If applications don't work, try these fixes:")
    print()
    print("1. 🖥️  Open manually in browser:")
    print("   file:///home/karina/Documents/Rinawarp-Platforms/working-apps/RinaWarp-Phone-Manager/index.html")
    print()
    print("2. 🌐 Use local server:")
    print("   cd working-apps/RinaWarp-Phone-Manager")
    print("   python -m http.server 8080")
    print("   # Then open: http://localhost:8080/")
    print()
    print("3. 🔧 Check browser console for JavaScript errors")
    print("4. 🧹 Clear browser cache")
    print("5. 📱 Test on different browsers")
    print()
    print("6. 🛠️  If launcher doesn't work, test manually:")
    print("   chmod +x launch-rinawarp-suite.sh")
    print("   ./launch-rinawarp-suite.sh")

if __name__ == "__main__":
    print("🔍 RINAWARP APPLICATIONS - COMPREHENSIVE ANALYSIS")
    print("=" * 60)
    
    apps = [
        "working-apps/RinaWarp-Phone-Manager/index.html",
        "working-apps/RinaWarp-Terminal-Pro/index.html", 
        "working-apps/RinaWarp-Music-Video-Creator/index.html"
    ]
    
    all_good = True
    
    for app in apps:
        if not analyze_html_file(app):
            all_good = False
    
    if not test_launch_script():
        all_good = False
    
    print("\n" + "=" * 60)
    if all_good:
        print("✅ ANALYSIS COMPLETE: Applications appear structurally correct")
        print("🔍 If they still don't work, the issue may be:")
        print("   • Browser security restrictions")
        print("   • JavaScript execution issues")
        print("   • CSS rendering problems")
        print("   • Missing dependencies")
    else:
        print("❌ ANALYSIS COMPLETE: Found structural issues")
    
    generate_fix_report()