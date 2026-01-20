# MYVIBES - Restaurant & Entertainment Discovery Platform

![MYVIBES](https://img.shields.io/badge/MYVIBES-Live-cyan)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

A mobile-first Progressive Web App (PWA) connecting restaurants and hotels with customers in South Africa.

## 🌟 Features

### For Customers
- 📍 **GPS-Powered Discovery** - Find nearby restaurants and hotels in real-time
- 🤖 **AI Recommendations** - Personalized suggestions based on your preferences
- 📱 **PWA Support** - Install as native app on any device
- ⚡ **Offline Mode** - Access menus and favorites without internet
- ⭐ **Reviews & Ratings** - Share experiences and read authentic reviews
- 🎫 **Daily Specials** - Discover today's deals and events
- 📅 **Reservations** - Book tables directly through the app
- ❤️ **Favorites** - Save and track your favorite venues

### For Businesses
- 💼 **Business Dashboard** - Comprehensive management portal
- 📊 **ML Analytics** - AI-powered insights and predictions
- 📝 **Menu Management** - Upload and update menus in real-time
- 🎉 **Events & Specials** - Post daily specials and upcoming events
- 💳 **Subscription Management** - Flexible pricing with Yoco integration
- 📧 **Automated Notifications** - Email and WhatsApp confirmations
- 📈 **Performance Analytics** - Track views, clicks, and conversions
- 🎯 **Age Group Categorization** - All Ages, Family+Pets, Adults 18+/21+

### For Admins
- 🌐 **Global Owner Portal** - Platform-wide management
- 📊 **Advanced Analytics** - ML-powered business intelligence
- 💰 **Affiliate Program** - Built-in referral system
- 🎬 **Social Media Ads** - Video ad management with approval workflow
- 📱 **Reservation Management** - Platform-wide booking oversight

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible components
- **Motion** (Framer Motion) - Smooth animations
- **Recharts** - Data visualization

### Backend
- **Supabase** - Backend-as-a-Service
  - Edge Functions (Hono server)
  - PostgreSQL Database
  - Key-Value Store
  - Authentication
  - File Storage
- **Deno Runtime** - Secure TypeScript runtime

### Integrations
- **SMTP2GO** - Email notifications
- **Yoco** - Payment processing
- **Google Maps API** - Location services
- **WhatsApp Business API** - Messaging (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/myvibes.git
cd myvibes
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run development server**
```bash
npm run dev
```

Visit http://localhost:5173

## 🚀 Deployment

### Quick Deploy (10 minutes)

Follow the comprehensive deployment guide:
- **Full Guide**: See [deploy.md](./deploy.md)
- **Quick Reference**: See [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
- **Architecture**: See [deployment-architecture.md](./deployment-architecture.md)

### Deploy Backend (Supabase)
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy make-server-175b2872

# Set environment secrets
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-key"
# ... (see deploy.md for full list)
```

### Deploy Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod

# Set environment variables in Vercel dashboard
```

## 📱 Progressive Web App (PWA)

MYVIBES is a fully-featured PWA:

- ✅ **Installable** on iOS, Android, and Desktop
- ✅ **Offline Support** with service worker
- ✅ **Push Notifications** for specials and updates
- ✅ **Fast Loading** with caching strategies
- ✅ **Native App Experience** in standalone mode

### Installation Guide
See [PWA-EXPLAINED.md](./PWA-EXPLAINED.md) for detailed information.

## 🗂️ Project Structure

```
myvibes/
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── BusinessDashboard.tsx
│   │   ├── CustomerApp.tsx
│   │   └── LandingPage.tsx
│   ├── config/              # Platform configuration
│   ├── styles/              # Global styles
│   └── utils/               # Utility functions
├── supabase/
│   └── functions/
│       └── server/          # Edge functions (Hono API)
├── public/                  # Static assets
├── deploy.md               # Deployment guide
├── QUICK-DEPLOY.md         # Quick reference
└── PWA-EXPLAINED.md        # PWA documentation
```

## 🔐 Environment Variables

### Frontend (Vercel)
```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Supabase Secrets)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...
SMTP2GO_API_KEY=your-smtp2go-key
YOCO_SECRET_KEY=your-yoco-key
GOOGLE_MAPS_API_KEY=your-maps-key
```

**⚠️ Never commit `.env` to version control!**

## 🧪 Testing

### Run Local Tests
```bash
npm run dev
```

### Test Checklist
- [ ] Customer app loads
- [ ] Can see nearby venues
- [ ] Location services work
- [ ] Can create account
- [ ] Can make reservations
- [ ] Business dashboard accessible
- [ ] Admin portal functional
- [ ] PWA installs correctly

## 📊 Features Overview

### Customer Features
- Real-time venue discovery with GPS
- AI-powered recommendations
- Advanced search and filters
- Rating and review system
- Favorite venues
- Offline mode
- Reservation system with email/WhatsApp notifications
- Daily specials and events feed

### Business Features
- Comprehensive dashboard
- Menu management (unlimited items)
- Daily specials posting
- Event advertising
- Reservation management (confirm/reject)
- Performance analytics
- ML insights (subscriber feature)
- Age group categorization
- Customer review responses

### Admin Features
- Global platform overview
- Business management
- Subscription tracking
- Affiliate program management
- Social media ad approval workflow
- Advanced ML analytics
- Platform-wide reservation oversight
- Revenue tracking

## 🎨 Branding

- **Name**: MYVIBES
- **Colors**: Cyan to Blue gradient
- **Logo**: Location pin
- **Target Market**: South Africa (expanding)
- **Business Model**: Freemium subscription (R499/month)

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a proprietary project. For access or collaboration inquiries, please contact the project owner.

## 📞 Support

For questions or issues:
- Email: support@myvibes.co.za
- Documentation: See `/deploy.md` and `/QUICK-DEPLOY.md`

## 🚀 Deployment Status

- **Frontend**: Deployed on Vercel
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL + KV Store
- **CDN**: Vercel Edge Network
- **Status**: Production Ready ✅

## 📈 Roadmap

- [x] PWA implementation
- [x] Offline mode
- [x] Reservation system
- [x] ML analytics
- [x] Affiliate program
- [x] Social media ads
- [ ] Multi-language support
- [ ] Expansion to other African markets
- [ ] iOS/Android native apps (future)

---

**Made with ❤️ in South Africa** | **Powered by Supabase + Vercel**

🌐 **Live Demo**: [Your Deployment URL]
