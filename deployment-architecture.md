# MYVIBES Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MYVIBES PLATFORM                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Customer Device    │         │   Business Device    │
│   (Mobile/Desktop)   │         │   (Tablet/Desktop)   │
│                      │         │                      │
│  📱 PWA Installed    │         │  💼 Dashboard        │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           └────────────┬────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   VERCEL CDN EDGE      │
           │  (Frontend Hosting)    │
           │                        │
           │  • React + Vite        │
           │  • Static Assets       │
           │  • PWA Service Worker  │
           │  • SSL/HTTPS          │
           └────────┬───────────────┘
                    │
                    ▼
           ┌────────────────────────┐
           │   SUPABASE BACKEND     │
           │                        │
           │  ┌──────────────────┐  │
           │  │  Edge Functions  │  │
           │  │  (Hono Server)   │  │
           │  │                  │  │
           │  │  • REST API      │  │
           │  │  • Auth          │  │
           │  │  • KV Store      │  │
           │  └──────────────────┘  │
           │                        │
           │  ┌──────────────────┐  │
           │  │  PostgreSQL DB   │  │
           │  │  • Key-Value     │  │
           │  │  • Reservations  │  │
           │  └──────────────────┘  │
           │                        │
           │  ┌──────────────────┐  │
           │  │  Auth System     │  │
           │  │  • User Mgmt     │  │
           │  └──────────────────┘  │
           └────────┬───────────────┘
                    │
        ────────────┼────────────────
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
┌──────────────┐        ┌──────────────┐
│  SMTP2GO     │        │   YOCO       │
│  (Email)     │        │  (Payments)  │
└──────────────┘        └──────────────┘
        │                        │
        ▼                        ▼
┌──────────────┐        ┌──────────────┐
│ Google Maps  │        │  WhatsApp    │
│ (Location)   │        │  (Optional)  │
└──────────────┘        └──────────────┘


═══════════════════════════════════════════════════════════════

DEPLOYMENT FLOW:
═══════════════════════════════════════════════════════════════

1. LOCAL DEVELOPMENT
   ├─ npm run dev
   ├─ Test at localhost:5173
   └─ Build: npm run build

2. DEPLOY BACKEND (Supabase)
   ├─ supabase login
   ├─ supabase link --project-ref xxx
   ├─ supabase functions deploy make-server-175b2872
   └─ supabase secrets set [ENV_VARS]

3. DEPLOY FRONTEND (Vercel)
   ├─ vercel login
   ├─ vercel (preview)
   ├─ vercel env add [ENV_VARS]
   └─ vercel --prod (production)

4. CONFIGURE DOMAIN
   ├─ vercel domains add myvibes.co.za
   ├─ Update DNS records
   └─ Wait for propagation

5. TEST & MONITOR
   ├─ Test all features
   ├─ Monitor logs
   └─ Set up alerts

═══════════════════════════════════════════════════════════════

DATA FLOW:
═══════════════════════════════════════════════════════════════

User Action → PWA → Vercel → Supabase Function → KV Store/DB
                                    ↓
                            External APIs (SMTP2GO, Yoco, etc.)
                                    ↓
                              Response → PWA → User


═══════════════════════════════════════════════════════════════

ENVIRONMENT VARIABLES:
═══════════════════════════════════════════════════════════════

FRONTEND (Vercel):
├─ VITE_SUPABASE_PROJECT_ID
└─ VITE_SUPABASE_ANON_KEY

BACKEND (Supabase Secrets):
├─ SUPABASE_URL
├─ SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
├─ SUPABASE_DB_URL
├─ SMTP2GO_API_KEY
├─ YOCO_SECRET_KEY
└─ GOOGLE_MAPS_API_KEY

═══════════════════════════════════════════════════════════════

URLS AFTER DEPLOYMENT:
═══════════════════════════════════════════════════════════════

Production URLs:
├─ Frontend: https://myvibes.vercel.app
├─ Custom Domain: https://myvibes.co.za
├─ API: https://[project].supabase.co/functions/v1/make-server-175b2872
├─ Admin: https://myvibes.co.za/admin
└─ Business: https://myvibes.co.za (login page)

═══════════════════════════════════════════════════════════════
```
