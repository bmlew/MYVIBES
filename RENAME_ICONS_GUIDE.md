# Mass Rename Icons: launchicon → icon

## Quick Methods to Rename Icon Files

---

## 🖥️ Method 1: Command Line (Mac/Linux)

### **Option A: Using `rename` command**

```bash
cd public/icons

# If you have the 'rename' command installed
rename 's/launchicon/icon/' launchicon-*.png

# Or use this version
rename 'launchicon' 'icon' launchicon-*.png
```

### **Option B: Using `mv` in a loop**

```bash
cd public/icons

# Rename all launchicon-*.png to icon-*.png
for file in launchicon-*.png; do
    mv "$file" "${file/launchicon/icon}"
done
```

### **Option C: One-liner with `sed`**

```bash
cd public/icons

# Rename all files
ls launchicon-*.png | sed 'p;s/launchicon/icon/' | xargs -n2 mv
```

---

## 🪟 Method 2: PowerShell (Windows)

### **Open PowerShell in the icons folder**

```powershell
cd public/icons

# Rename all launchicon-*.png to icon-*.png
Get-ChildItem -Filter "launchicon-*.png" | Rename-Item -NewName {$_.name -replace 'launchicon','icon'}
```

---

## 💻 Method 3: Command Prompt (Windows)

```cmd
cd public\icons

# Rename files one by one
ren launchicon-72x72.png icon-72x72.png
ren launchicon-96x96.png icon-96x96.png
ren launchicon-128x128.png icon-128x128.png
ren launchicon-144x144.png icon-144x144.png
ren launchicon-152x152.png icon-152x152.png
ren launchicon-192x192.png icon-192x192.png
ren launchicon-384x384.png icon-384x384.png
ren launchicon-512x512.png icon-512x512.png
```

---

## 📂 Method 4: File Explorer (GUI Method)

### **Windows:**
1. Navigate to `public/icons` folder
2. Right-click on first file → Rename (or press F2)
3. Change `launchicon-72x72.png` to `icon-72x72.png`
4. Press Enter
5. Repeat for each file

**PowerToys Tip:** Install [PowerToys](https://github.com/microsoft/PowerToys) and use PowerRename:
1. Select all `launchicon-*.png` files
2. Right-click → PowerRename
3. Search for: `launchicon`
4. Replace with: `icon`
5. Click Rename

### **Mac:**
1. Navigate to `public/icons` folder
2. Select first file
3. Press Enter to rename
4. Change `launchicon-72x72.png` to `icon-72x72.png`
5. Press Enter
6. Repeat for each file

---

## 🟢 Method 5: Node.js Script (Cross-Platform)

Create a file called `rename-icons.js` in your project root:

```javascript
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');

fs.readdir(iconsDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.startsWith('launchicon-') && file.endsWith('.png')) {
      const oldPath = path.join(iconsDir, file);
      const newPath = path.join(iconsDir, file.replace('launchicon', 'icon'));
      
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming ${file}:`, err);
        } else {
          console.log(`✅ Renamed: ${file} → ${file.replace('launchicon', 'icon')}`);
        }
      });
    }
  });
});
```

**Run the script:**
```bash
node rename-icons.js
```

---

## 🐍 Method 6: Python Script (Cross-Platform)

Create a file called `rename_icons.py`:

```python
import os
from pathlib import Path

icons_dir = Path('public/icons')

for file in icons_dir.glob('launchicon-*.png'):
    new_name = file.name.replace('launchicon', 'icon')
    new_path = file.parent / new_name
    file.rename(new_path)
    print(f'✅ Renamed: {file.name} → {new_name}')

print('Done!')
```

**Run the script:**
```bash
python rename_icons.py
```

---

## ✅ Verify the Rename

After renaming, verify you have these files:

```bash
cd public/icons
ls -la icon-*.png
```

**Expected output:**
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

---

## 🧪 Test After Renaming

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Open DevTools** (F12) → Application → Manifest
4. **Check icons** - All should load without errors
5. **Try installing** the PWA

---

## 🚨 Troubleshooting

### **"Command not found: rename"**

**On Mac:** Install rename using Homebrew
```bash
brew install rename
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install rename
```

### **Files still showing as broken in manifest**

1. Check file names **exactly match** manifest.json
2. Clear browser cache completely
3. Hard refresh (Ctrl+Shift+R)
4. Restart your dev server

### **Permission denied errors**

**Mac/Linux:**
```bash
chmod +w public/icons/*
```

**Windows:** Right-click folder → Properties → Uncheck "Read-only"

---

## 📋 Quick Copy-Paste Commands

### **Mac/Linux (Fastest):**
```bash
cd public/icons && for file in launchicon-*.png; do mv "$file" "${file/launchicon/icon}"; done && ls -la icon-*.png
```

### **Windows PowerShell (Fastest):**
```powershell
cd public\icons; Get-ChildItem -Filter "launchicon-*.png" | Rename-Item -NewName {$_.name -replace 'launchicon','icon'}; Get-ChildItem icon-*.png
```

---

## ✨ All Done!

After renaming:
- ✅ Icons match manifest.json
- ✅ PWA can find all icons
- ✅ Installation should work
- ✅ No broken image icons

**Next step:** Test the PWA installation!

