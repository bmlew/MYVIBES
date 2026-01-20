# MYVIBES Deployment Guide - Vercel + Supabase

## Prerequisites
- Node.js 18+ installed
- npm or yarn installed
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)

---

## STEP 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: myvibes-production
   - **Database Password**: [Create strong password - SAVE THIS!]
   - **Region**: Choose closest to South Africa (e.g., Europe West)
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Your Credentials

Once project is created, go to **Settings → API**:

Copy these values (you'll need them):
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

Go to **Settings → Database** and copy:
```
Connection string (URI): postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 1.3 Install Supabase CLI

```bash
npm install -g supabase
```

### 1.4 Login to Supabase

```bash
supabase login
```

This will open your browser - authorize the CLI.

### 1.5 Link Your Project

```bash
# Find your project reference ID from Supabase dashboard URL
# Example: https://supabase.com/dashboard/project/abcdefghijklmnop
# The "abcdefghijklmnop" is your project-ref

supabase link --project-ref your-project-ref-here
```

### 1.6 Deploy Edge Functions

```bash
# Navigate to your project root
cd /path/to/myvibes

# Deploy the server function
supabase functions deploy make-server-175b2872
```

Expected output:
```
✓ Deploying function make-server-175b2872
✓ Function deployed successfully
```

### 1.7 Set Environment Secrets

```bash
# Set Supabase credentials
supabase secrets set SUPABASE_URL="https://xxxxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx"
supabase secrets set SUPABASE_DB_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# Set third-party API keys (already provided by user)
supabase secrets set SMTP2GO_API_KEY="your-smtp2go-api-key"
supabase secrets set YOCO_SECRET_KEY="your-yoco-secret-key"
supabase secrets set GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 1.8 Enable Email Auth (Optional but Recommended)

Go to **Authentication → Providers** in Supabase dashboard:
- Enable "Email" provider
- Configure email templates if desired

---

## STEP 2: Update Frontend Configuration

### 2.1 Update Supabase Connection Info

Edit `/src/utils/supabase/info.tsx`:

```typescript
// Replace with your production values
export const projectId = 'your-project-ref-here'; // From Supabase URL
export const publicAnonKey = 'your-anon-key-here';
```

**ALTERNATIVE (Recommended):** Use environment variables instead:

Update `/src/utils/supabase/info.tsx` to:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

### 2.2 Create .env File (For Local Testing)

Create `.env` in project root:

```env
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 2.3 Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:5173 and test:
- ✅ App loads
- ✅ Can see venues
- ✅ Can create account

---

## STEP 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

Enter your email and click the verification link.

### 3.3 Deploy

```bash
# From project root
vercel
```

**Follow the prompts:**

```
? Set up and deploy "~/myvibes"? [Y/n] Y
? Which scope? [Select your account]
? Link to existing project? [N]
? What's your project's name? myvibes
? In which directory is your code located? ./
```

Vercel will auto-detect Vite and configure build settings.

### 3.4 Set Environment Variables in Vercel

**Option A: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project "myvibes"
3. Go to **Settings → Environment Variables**
4. Add these variables (for all environments: Production, Preview, Development):

```
VITE_SUPABASE_PROJECT_ID = your-project-ref
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Option B: Via CLI**

```bash
vercel env add VITE_SUPABASE_PROJECT_ID production
# Paste your project ID when prompted

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key when prompted
```

### 3.5 Production Deploy

```bash
vercel --prod
```

Expected output:
```
✓ Production: https://myvibes.vercel.app [copied]
```

**🎉 Your app is now live!**

---

## STEP 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

```bash
vercel domains add myvibes.co.za
```

Or via dashboard:
1. Project Settings → Domains
2. Add "myvibes.co.za"

### 4.2 Update DNS Records

In your domain registrar (e.g., GoDaddy, Namecheap):

**For Root Domain (myvibes.co.za):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 24-48 hours for DNS propagation (usually much faster).

### 4.3 Update PWA Manifest

Edit `/public/manifest.json`:

```json
{
  "name": "MYVIBES",
  "short_name": "MYVIBES",
  "start_url": "https://myvibes.co.za",
  "scope": "https://myvibes.co.za",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#06b6d4",
  "description": "Find your vibe tonight - Discover restaurants and entertainment",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Redeploy:
```bash
vercel --prod
```

---

## STEP 5: Post-Deployment Testing

### 5.1 Test Checklist

Visit your deployed URL and test:

**Customer App:**
- [ ] App loads properly
- [ ] Can see venues/restaurants
- [ ] Location permission works
- [ ] Can search and filter
- [ ] Can view venue details
- [ ] Can create customer account
- [ ] Can leave reviews
- [ ] Can make reservations
- [ ] PWA install prompt appears (mobile)

**Business Dashboard:**
- [ ] Can login with business credentials
- [ ] Can view dashboard
- [ ] Can add/edit menu items
- [ ] Can post specials
- [ ] Can manage reservations
- [ ] Analytics display correctly

**Admin Portal:**
- [ ] Can access admin dashboard
- [ ] Can see all businesses
- [ ] Analytics load properly
- [ ] Can approve social media ads

### 5.2 Test Email Notifications

Make a test reservation and verify:
- [ ] Customer receives confirmation email
- [ ] Business owner receives notification
- [ ] Emails have correct branding (MYVIBES)

### 5.3 Test PWA Installation

**On Mobile (iOS/Android):**
1. Visit site in browser
2. Look for "Add to Home Screen" banner
3. Install app
4. Launch from home screen
5. Verify it opens full-screen (no browser UI)

**On Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

---

## STEP 6: Enable CORS (Important!)

### 6.1 Update Server CORS Settings

Edit `/supabase/functions/server/index.tsx`:

Find the CORS configuration and add your production domain:

```typescript
import { cors } from 'npm:hono/cors';

app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://myvibes.vercel.app',
    'https://myvibes.co.za',
    'https://www.myvibes.co.za'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
```

Redeploy the function:
```bash
supabase functions deploy make-server-175b2872
```

---

## STEP 7: Monitoring & Maintenance

### 7.1 View Logs

**Supabase Function Logs:**
```bash
supabase functions logs make-server-175b2872
```

Or view in dashboard: **Edge Functions → make-server-175b2872 → Logs**

**Vercel Deployment Logs:**
- Dashboard → Project → Deployments → Select deployment → Logs

### 7.2 Set Up Alerts (Optional)

**Vercel:**
- Integrations → Add Slack/Discord for deployment notifications

**Supabase:**
- Dashboard → Project Settings → Integrations

### 7.3 Monitor Performance

Use Vercel Analytics (free tier):
1. Go to Analytics tab in Vercel dashboard
2. Enable Web Analytics
3. Track page views, performance, etc.

---

## Troubleshooting Common Issues

### Issue: "Failed to fetch" errors

**Fix:** Check CORS configuration in server function

### Issue: Environment variables not working

**Fix:** 
1. Verify variables are set correctly in Vercel
2. Variable names must start with `VITE_` for Vite apps
3. Redeploy after adding variables

### Issue: 404 errors on page refresh

**Fix:** Already configured in `vercel.json` - verify file exists:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue: PWA not installing

**Fix:**
1. Must be HTTPS (Vercel provides this)
2. Check manifest.json is accessible
3. Check service worker is registered
4. Try incognito/private mode

### Issue: Emails not sending

**Fix:**
1. Verify SMTP2GO_API_KEY is set in Supabase secrets
2. Check function logs for errors
3. Verify domain in SMTP2GO dashboard

---

## Quick Reference Commands

```bash
# Deploy Supabase function
supabase functions deploy make-server-175b2872

# View function logs
supabase functions logs make-server-175b2872

# Deploy to Vercel (preview)
vercel

# Deploy to Vercel (production)
vercel --prod

# View Vercel logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME production
```

---

## Production URLs

After deployment:
- **Frontend**: https://myvibes.vercel.app (or custom domain)
- **API**: https://[your-project-ref].supabase.co/functions/v1/make-server-175b2872
- **Admin**: https://myvibes.vercel.app/admin
- **Business Login**: https://myvibes.vercel.app (click Business Login)

---

## Security Checklist

- [ ] Service role key is ONLY in Supabase secrets (never in frontend)
- [ ] CORS is configured for production domains only
- [ ] Environment variables are set in Vercel (not committed to git)
- [ ] SSL/HTTPS is enabled (automatic with Vercel)
- [ ] API keys are in environment variables
- [ ] Row Level Security is enabled in Supabase (if using Postgres directly)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Discord**: https://discord.supabase.com

---

🎉 **Congratulations! MYVIBES is now deployed and live!** 🎉
