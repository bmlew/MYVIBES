#!/usr/bin/env python3
"""
Bulk color replacement script for MYVIBE rebrand
Replaces orange-purple gradients with cyan-blue gradients
"""

import re
from pathlib import Path

# Color replacement mappings
REPLACEMENTS = [
    # Gradient combinations
    (r'from-orange-500 to-purple-600', 'from-cyan-500 to-blue-600'),
    (r'from-orange-600 to-purple-700', 'from-cyan-600 to-blue-700'),
    (r'from-orange-400 to-purple-500', 'from-cyan-400 to-teal-500'),
    (r'from-orange-100 to-purple-100', 'from-cyan-100 to-blue-100'),
    (r'from-orange-50 to-purple-50', 'from-cyan-50 to-blue-50'),
    (r'from-orange-500 via-pink-500 to-purple-600', 'from-cyan-500 via-blue-500 to-blue-900'),
    (r'from-orange-500 via-purple-600 to-pink-600', 'from-cyan-500 via-blue-600 to-blue-900'),
    
    # Individual color classes (be careful not to replace needed orange/purple)
    (r'text-orange-500', 'text-cyan-500'),
    (r'text-orange-600', 'text-cyan-600'),
    (r'bg-orange-500', 'bg-cyan-500'),
    (r'bg-orange-600', 'bg-cyan-600'),
    (r'border-orange-500', 'border-cyan-500'),
    (r'hover:from-orange-600', 'hover:from-cyan-600'),
    (r'hover:to-purple-700', 'hover:to-blue-700'),
    (r'hover:border-orange-500', 'hover:border-cyan-500'),
    (r'hover:text-orange-500', 'hover:text-cyan-500'),
    
    # Purple to blue replacements
    (r'text-purple-600', 'text-blue-600'),
    (r'bg-purple-600', 'bg-blue-600'),
    (r'border-purple-600', 'border-cyan-500'),
]

def update_file(filepath):
    """Update a single file with color replacements"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = 0
        
        for old_pattern, new_pattern in REPLACEMENTS:
            count = content.count(old_pattern)
            if count > 0:
                content = content.replace(old_pattern, new_pattern)
                changes_made += count
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath.name}: {changes_made} replacements")
            return changes_made
        return 0
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return 0

def main():
    """Process all TypeScript/TSX files"""
    base_path = Path('/tmp/sandbox/src')
    
    total_files = 0
    total_changes = 0
    
    # Process all .tsx and .ts files
    for filepath in base_path.rglob('*.tsx'):
        changes = update_file(filepath)
        if changes > 0:
            total_files += 1
            total_changes += changes
    
    print(f"\n🎨 Color Update Complete!")
    print(f"📁 Files updated: {total_files}")
    print(f"🔄 Total replacements: {total_changes}")

if __name__ == '__main__':
    main()
