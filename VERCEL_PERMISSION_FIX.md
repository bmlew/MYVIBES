# Vercel Permission Denied Fix

## ❌ Error Encountered
```
sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

## 🔍 Root Cause
Vercel's build environment sometimes doesn't set correct execution permissions on binaries in `node_modules/.bin/`, particularly for newer versions of Vite and other tools.

## ✅ Solution Applied

### 1. Updated Build Scripts in package.json
Changed from direct binary execution to `npx`:

**Before:**
```json
"scripts": {
  "build": "vite build"
}
```

**After:**
```json
"scripts": {
  "build": "npx vite build",
  "dev": "npx vite",
  "preview": "npx vite preview"
}
```

**Why this works:** `npx` handles permissions and binary resolution automatically, making it more reliable in CI/CD environments like Vercel.

### 2. Updated vercel.json
Added `--legacy-peer-deps` flag to the install command:

```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Why this helps:** Some packages have peer dependency conflicts that can cause installation issues. This flag allows npm to proceed with installation even if there are peer dependency warnings.

## 🚀 Next Steps

### 1. Commit and Push Changes
```bash
git add package.json vercel.json
git commit -m "Fix Vercel build permission error with npx"
git push origin main
```

### 2. Redeploy on Vercel
Vercel will automatically trigger a new deployment with these changes.

### 3. Monitor Build Logs
Watch for successful build output:
```
✓ vite v6.3.5 building for production...
✓ XX modules transformed.
✓ built in XXs

PWA v1.2.0
✓ built in XXXms
```

## 🔄 Alternative Solutions (if issue persists)

### Option 1: Clear Build Cache
In Vercel Dashboard:
1. Go to Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Redeploy

### Option 2: Use Different Node Version
In vercel.json, add:
```json
{
  "functions": {
    "node": "20.x"
  }
}
```

### Option 3: Custom Build Command
In vercel.json:
```json
{
  "buildCommand": "chmod +x node_modules/.bin/* && npm run build"
}
```

### Option 4: Use pnpm Instead
In vercel.json:
```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm run build"
}
```

## ✅ Expected Build Timeline

1. **Cloning:** ~5-10 seconds
2. **Installing dependencies:** ~2-5 seconds (with cache)
3. **Building:** ~30-60 seconds
4. **Deploying:** ~5-10 seconds

**Total:** ~1-2 minutes for a successful deployment

## 🐛 Debugging Commands

### Test locally with npx:
```bash
# Clean build
rm -rf dist node_modules

# Fresh install
npm install

# Build with npx
npx vite build
```

### Verify it works:
```bash
# Should see successful build output
npx vite preview
```

## 📊 Common Exit Codes

- **Exit 0:** Success ✅
- **Exit 1:** General error (check logs)
- **Exit 126:** Permission denied ❌ (this error)
- **Exit 127:** Command not found
- **Exit 137:** Out of memory

## ✅ Status

- [x] Updated package.json scripts to use npx
- [x] Updated vercel.json with legacy-peer-deps
- [x] Ready for redeployment
- [ ] Awaiting successful Vercel build

---

**Date Fixed:** January 21, 2025
**Issue:** Permission denied on vite binary
**Solution:** Use npx instead of direct binary execution
**Status:** ✅ Ready to redeploy
