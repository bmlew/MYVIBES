import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';
import { seedDatabase } from './seed_data.tsx';
import { 
  sendReservationConfirmation, 
  sendBusinessNotification, 
  sendAdminWhatsAppNotification,
  sendWhatsApp
} from './notifications.tsx';

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Track if database has been seeded
let isSeeded = false;
let seedingInProgress = false;

// Auto-seed middleware - checks and seeds database on first request
app.use('*', async (c, next) => {
  if (!isSeeded && !seedingInProgress) {
    seedingInProgress = true;
    try {
      console.log('🔍 Checking if database needs seeding...');
      const businesses = await kv.getByPrefix('business:');
      
      if (!businesses || businesses.length === 0) {
        console.log('🌱 Database empty, auto-seeding...');
        await seedDatabase();
        console.log('✅ Auto-seed completed');
      } else {
        console.log(`✅ Database already has ${businesses.length} businesses`);
      }
      isSeeded = true;
    } catch (error) {
      console.error('❌ Auto-seed error:', error);
      isSeeded = true; // Mark as seeded anyway to prevent infinite retries
    } finally {
      seedingInProgress = false;
    }
  }
  
  // Wait if seeding is in progress (with timeout to prevent hanging)
  let waitTime = 0;
  const maxWait = 30000; // 30 seconds max
  while (seedingInProgress && waitTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100));
    waitTime += 100;
  }
  
  if (seedingInProgress) {
    console.warn('⚠️ Seeding timeout, proceeding anyway');
  }
  
  await next();
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Generate recommendation reason based on various factors
function generateRecommendationReason(timeOfDay: string, isWeekend: boolean, score: number, special: any): string {
  const reasons = [];
  
  if (special.discount_percentage && special.discount_percentage > 20) {
    reasons.push(`${special.discount_percentage}% off`);
  }
  
  if (timeOfDay === 'morning' && special.title.toLowerCase().includes('breakfast')) {
    reasons.push('Perfect for breakfast');
  } else if (timeOfDay === 'afternoon' && special.title.toLowerCase().includes('lunch')) {
    reasons.push('Great lunch deal');
  } else if (timeOfDay === 'evening' && (special.title.toLowerCase().includes('dinner') || special.title.toLowerCase().includes('happy'))) {
    reasons.push('Evening special');
  }
  
  if (isWeekend && special.title.toLowerCase().includes('weekend')) {
    reasons.push('Weekend exclusive');
  }
  
  if (score > 80) {
    reasons.push('Highly recommended');
  } else if (score > 60) {
    reasons.push('Popular choice');
  }
  
  return reasons.length > 0 ? reasons.join(' • ') : 'Special offer available';
}

// Generate tags for recommendations
function generateTags(special: any, score: number, timeOfDay: string): string[] {
  const tags = [];
  
  if (special.discount_percentage && special.discount_percentage > 30) {
    tags.push('Best Deal');
  }
  
  if (score > 80) {
    tags.push('Top Pick');
  }
  
  if (timeOfDay === 'evening') {
    tags.push('Tonight');
  }
  
  if (special.title.toLowerCase().includes('new')) {
    tags.push('New');
  }
  
  return tags;
}

// ============================================
// BUSINESS AUTHENTICATION
// ============================================

// Business Registration
app.post("/make-server-175b2872/auth/business/register", async (c) => {
  try {
    const body = await c.req.json();
    const { business_name, owner_name, email, phone, address, city, password, affiliate_code } = body;

    // Validate required fields
    if (!business_name || !owner_name || !email || !phone || !address || !city || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Validate affiliate code if provided
    let validAffiliate = null;
    if (affiliate_code && affiliate_code.trim()) {
      const affiliates = await kv.getByPrefix('affiliate:');
      validAffiliate = affiliates.find(
        (aff: any) => aff.code === affiliate_code.toUpperCase().trim() && aff.status === 'approved'
      );
      
      if (!validAffiliate) {
        return c.json({ error: 'Invalid or inactive affiliate code. Please check and try again.' }, 400);
      }
      
      console.log(`✅ Valid affiliate code: ${affiliate_code} - Affiliate: ${validAffiliate.name}`);
    }

    // Check if email already exists
    const existingBusinesses = await kv.getByPrefix('business:');
    const emailExists = existingBusinesses.some((b: any) => b.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server
      user_metadata: {
        business_name,
        owner_name,
        role: 'business_owner'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Failed to create account' }, 500);
    }

    // Create business record in KV store
    const businessId = `business-${Date.now()}`;
    const business = {
      id: businessId,
      user_id: authData.user.id,
      name: business_name,
      owner_name,
      email,
      phone,
      address,
      city,
      description: '',
      business_type: 'restaurant',
      cuisine_types: [],
      // Default coordinates for registered businesses (will be updated when they add proper address)
      // Using Sandton, Johannesburg as default
      latitude: city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton') 
        ? -26.1076 
        : city.toLowerCase().includes('cape town') 
        ? -33.9249 
        : city.toLowerCase().includes('durban')
        ? -29.8587
        : -26.1076, // Default to Johannesburg
      longitude: city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton')
        ? 28.0567
        : city.toLowerCase().includes('cape town')
        ? 18.4241
        : city.toLowerCase().includes('durban')
        ? 31.0218
        : 28.0567, // Default to Johannesburg
      price_range: '$$',
      logo_url: null,
      cover_image_url: null,
      is_active: false, // Inactive until subscription payment is made
      subscription_status: 'pending_payment',
      payment_status: 'pending',
      subscription_price: 299, // R299 monthly subscription
      next_payment_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days to pay
      average_rating: 0,
      total_reviews: 0,
      total_views: 0,
      affiliate_code: validAffiliate ? affiliate_code.toUpperCase().trim() : null,
      referred_by: validAffiliate ? validAffiliate.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`business:${businessId}`, business);

    // If affiliate code used, increment referral count
    if (validAffiliate) {
      validAffiliate.total_referrals = (validAffiliate.total_referrals || 0) + 1;
      await kv.set(`affiliate:${validAffiliate.id}`, validAffiliate);
      console.log(`💰 Affiliate ${validAffiliate.name} credited with new referral. Total: ${validAffiliate.total_referrals}`);
    }

    // Generate Yoco payment link for initial subscription
    const settings = await kv.get('platform:settings') || { monthly_subscription_fee: 299 };
    const amount = settings.monthly_subscription_fee * 100; // Convert to cents
    
    let paymentLink = null;
    try {
      const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('YOCO_SECRET_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'ZAR',
          cancelUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/cancelled`,
          successUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/success`,
          failureUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/failed`,
          metadata: {
            business_id: businessId,
            business_name: business_name,
            payment_type: 'initial_subscription',
            month: new Date().toISOString().slice(0, 7)
          }
        })
      });
      
      if (yocoResponse.ok) {
        const yocoData = await yocoResponse.json();
        paymentLink = yocoData.redirectUrl;
        
        // Update business with payment link
        business.payment_link = paymentLink;
        await kv.set(`business:${businessId}`, business);
        
        console.log(`✅ Payment link generated for new business: ${paymentLink}`);
      }
    } catch (yocoError) {
      console.error('⚠️ Failed to generate payment link:', yocoError);
      // Continue with registration even if payment link generation fails
    }

    return c.json({
      success: true,
      message: 'Business registered successfully. Please complete payment to activate your account.',
      business_id: businessId,
      payment_link: paymentLink,
      payment_required: true,
      subscription_fee: settings.monthly_subscription_fee
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Business Sign In
app.post("/make-server-175b2872/auth/business/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Find business by user_id
    const allBusinesses = await kv.getByPrefix('business:');
    const business = allBusinesses.find((b: any) => b.user_id === authData.user.id);

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({
      success: true,
      access_token: authData.session?.access_token,
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        owner_name: business.owner_name
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Sign in failed' }, 500);
  }
});

// Forgot Password
app.post("/make-server-175b2872/auth/business/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if business exists
    const allBusinesses = await kv.getByPrefix('business:');
    const business = allBusinesses.find((b: any) => b.email === email);

    if (!business) {
      return c.json({ error: 'Email not found' }, 404);
    }

    // In production, send password reset email via Supabase
    // For demo, we'll just confirm the email exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get('SUPABASE_URL')}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
    }

    // Always return success to avoid email enumeration
    return c.json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Failed to process request' }, 500);
  }
});

// ============================================
// AFFILIATE & COMMISSION ENDPOINTS
// ============================================

// Payment Webhook - Calculate and allocate affiliate commissions
app.post("/make-server-175b2872/webhooks/payment", async (c) => {
  try {
    const { business_id, amount, status, payment_type } = await c.req.json();
    
    if (status !== 'paid' || payment_type !== 'subscription') {
      return c.json({ success: true, message: 'Not a subscription payment' });
    }

    // Get business
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    // Check if business was referred by affiliate
    if (!business.referred_by) {
      return c.json({ success: true, message: 'No affiliate referral' });
    }

    // Get platform settings for commission percentage
    const settings = await kv.get('platform:settings') || { 
      monthly_subscription_fee: 499, 
      affiliate_commission_percentage: 10 
    };
    
    const subscriptionFee = settings.monthly_subscription_fee;
    const commissionPercentage = settings.affiliate_commission_percentage;
    const commission = (subscriptionFee * commissionPercentage) / 100;

    // Get affiliate
    const affiliate = await kv.get(`affiliate:${business.referred_by}`);
    if (!affiliate) {
      console.warn(`Affiliate ${business.referred_by} not found for business ${business_id}`);
      return c.json({ success: true, message: 'Affiliate not found' });
    }

    // Update affiliate earnings
    affiliate.total_commission_earned = (affiliate.total_commission_earned || 0) + commission;
    affiliate.pending_commission = (affiliate.pending_commission || 0) + commission;
    await kv.set(`affiliate:${affiliate.id}`, affiliate);

    // Create commission record
    const commissionId = `commission:${affiliate.id}:${Date.now()}`;
    const commissionRecord = {
      id: commissionId,
      affiliate_id: affiliate.id,
      affiliate_name: affiliate.name,
      business_id: business_id,
      business_name: business.name,
      amount: commission,
      subscription_amount: subscriptionFee,
      commission_percentage: commissionPercentage,
      status: 'pending',
      created_at: new Date().toISOString(),
      paid_at: null
    };
    
    await kv.set(commissionId, commissionRecord);

    console.log(`💰 Commission R${commission.toFixed(2)} (${commissionPercentage}%) credited to ${affiliate.name} for ${business.name}`);

    return c.json({ 
      success: true, 
      commission_earned: commission,
      affiliate_name: affiliate.name
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Get all affiliates (for admin)
app.get("/make-server-175b2872/affiliates", async (c) => {
  try {
    const affiliates = await kv.getByPrefix('affiliate:');
    return c.json({ affiliates });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return c.json({ error: 'Failed to fetch affiliates' }, 500);
  }
});

// Register new affiliate
app.post("/make-server-175b2872/affiliates/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, company, website, experience } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return c.json({ error: 'Name, email, and phone are required' }, 400);
    }

    // Check if email already exists
    const existingAffiliates = await kv.getByPrefix('affiliate:');
    const emailExists = existingAffiliates.some((aff: any) => aff.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already registered as affiliate' }, 400);
    }

    // Generate unique affiliate code (first 4 letters of name + year)
    const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    let affiliateCode = `${namePrefix}${year}`;
    
    // Ensure code is unique
    let codeExists = existingAffiliates.some((aff: any) => aff.code === affiliateCode);
    let counter = 1;
    while (codeExists) {
      affiliateCode = `${namePrefix}${year}${counter}`;
      codeExists = existingAffiliates.some((aff: any) => aff.code === affiliateCode);
      counter++;
    }

    // Create affiliate record
    const affiliateId = `AFF${Date.now()}`;
    const affiliate = {
      id: affiliateId,
      code: affiliateCode,
      name,
      email,
      phone,
      company: company || null,
      website: website || null,
      experience: experience || null,
      status: 'pending',
      total_referrals: 0,
      total_commission_earned: 0,
      pending_commission: 0,
      paid_commission: 0,
      approved_at: null,
      approved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`affiliate:${affiliateId}`, affiliate);

    console.log(`✅ New affiliate registered: ${name} (${affiliateCode})`);

    return c.json({ 
      success: true, 
      affiliate,
      message: 'Application submitted successfully. You will be notified once approved.'
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Affiliate login
app.post("/make-server-175b2872/affiliates/login", async (c) => {
  try {
    const { email, code } = await c.req.json();

    if (!email || !code) {
      return c.json({ error: 'Email and code are required' }, 400);
    }

    // Find affiliate by email and code
    const affiliates = await kv.getByPrefix('affiliate:');
    const affiliate = affiliates.find(
      (aff: any) => aff.email === email && aff.code === code.toUpperCase()
    );

    if (!affiliate) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    return c.json({ success: true, affiliate });
  } catch (error) {
    console.error('Affiliate login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get single affiliate by ID
app.get("/make-server-175b2872/affiliates/:id", async (c) => {
  try {
    const affiliateId = c.req.param('id');
    const affiliate = await kv.get(`affiliate:${affiliateId}`);
    
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }

    return c.json({ affiliate });
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return c.json({ error: 'Failed to fetch affiliate' }, 500);
  }
});

// Get affiliate commissions
app.get("/make-server-175b2872/affiliates/:id/commissions", async (c) => {
  try {
    const affiliateId = c.req.param('id');
    
    // Get all commission records for this affiliate
    const allCommissions = await kv.getByPrefix('commission:');
    const affiliateCommissions = allCommissions.filter(
      (comm: any) => comm.affiliate_id === affiliateId
    );

    // Sort by date (newest first)
    affiliateCommissions.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ commissions: affiliateCommissions });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return c.json({ error: 'Failed to fetch commissions' }, 500);
  }
});

// Approve affiliate
app.post("/make-server-175b2872/affiliates/:id/approve", async (c) => {
  try {
    const affiliateId = c.req.param('id');
    const affiliate = await kv.get(`affiliate:${affiliateId}`);
    
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }

    affiliate.status = 'approved';
    affiliate.approved_at = new Date().toISOString();
    affiliate.approved_by = 'admin@myvibe.co.za';
    
    await kv.set(`affiliate:${affiliateId}`, affiliate);

    // Send approval email with affiliate code
    try {
      const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px"><div style="background:linear-gradient(135deg,#f97316 0%,#a855f7 100%);padding:30px;text-align:center;border-radius:10px 10px 0 0"><h1 style="color:white;margin:0;font-size:28px">🎉 Congratulations, ${affiliate.name}!</h1></div><div style="background:#fff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px"><p style="font-size:16px;margin-bottom:20px">Great news! Your application to join the MYVIBE Affiliate Program has been <strong style="color:#10b981">approved</strong>! 🚀</p><div style="background:linear-gradient(135deg,#fef3c7 0%,#e9d5ff 100%);padding:20px;border-radius:10px;margin:25px 0;text-align:center;border:2px solid #a855f7"><p style="margin:0 0 10px 0;font-size:14px;color:#6b7280">Your Unique Affiliate Code:</p><p style="margin:0;font-size:32px;font-weight:bold;font-family:'Courier New',monospace;color:#7c3aed;letter-spacing:2px">${affiliate.code}</p></div><h2 style="color:#7c3aed;font-size:20px;margin-top:30px">💰 How to Start Earning:</h2><ol style="padding-left:20px;margin:15px 0"><li style="margin-bottom:10px"><strong>Share your code:</strong> Give code <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-family:monospace">${affiliate.code}</code> to restaurant/hotel owners</li><li style="margin-bottom:10px"><strong>They register:</strong> When they sign up, they enter your code</li><li style="margin-bottom:10px"><strong>You earn:</strong> Receive <strong>R49.90/month</strong> (10% commission) per subscription</li><li style="margin-bottom:10px"><strong>Recurring income:</strong> Keep earning monthly!</li></ol><div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:25px 0;border-radius:5px"><p style="margin:0;font-size:14px;color:#92400e"><strong>📈 Earnings Example:</strong><br>• 10 businesses = <strong>R499/month</strong><br>• 50 businesses = <strong>R2,495/month</strong><br>• 100 businesses = <strong>R4,990/month</strong></p></div><hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0"><p style="font-size:14px;color:#6b7280">Welcome to the MYVIBE family! 🚀</p></div></body></html>`;
      
      const emailResponse = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': Deno.env.get('SMTP2GO_API_KEY') || ''
        },
        body: JSON.stringify({
          sender: 'MYVIBE Affiliate Program <noreply@myvibe.co.za>',
          to: [affiliate.email],
          subject: '🎉 Your MYVIBE Affiliate Application Has Been Approved!',
          html_body: emailHtml,
          text_body: `Congratulations ${affiliate.name}!\n\nYour MYVIBE Affiliate application is APPROVED!\n\nYOUR CODE: ${affiliate.code}\n\nShare this code with restaurant/hotel owners to earn R49.90/month per subscription.\n\nWelcome to MYVIBE!`
        })
      });

      if (emailResponse.ok) {
        console.log(`📧 Approval email sent to ${affiliate.email} with code ${affiliate.code}`);
      } else {
        console.error('Failed to send approval email');
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    return c.json({ success: true, affiliate });
  } catch (error) {
    console.error('Error approving affiliate:', error);
    return c.json({ error: 'Failed to approve affiliate' }, 500);
  }
});

// Mark commission as paid
app.post("/make-server-175b2872/commissions/:id/mark-paid", async (c) => {
  try {
    const commissionId = c.req.param('id');
    const commission = await kv.get(commissionId);
    
    if (!commission) {
      return c.json({ error: 'Commission not found' }, 404);
    }

    // Get affiliate
    const affiliate = await kv.get(`affiliate:${commission.affiliate_id}`);
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }

    // Update commission status
    commission.status = 'paid';
    commission.paid_at = new Date().toISOString();
    await kv.set(commissionId, commission);

    // Update affiliate balances
    affiliate.pending_commission = Math.max(0, (affiliate.pending_commission || 0) - commission.amount);
    affiliate.paid_commission = (affiliate.paid_commission || 0) + commission.amount;
    await kv.set(`affiliate:${affiliate.id}`, affiliate);

    console.log(`✅ Commission R${commission.amount.toFixed(2)} marked as paid for ${affiliate.name}`);

    return c.json({ success: true, commission, affiliate });
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    return c.json({ error: 'Failed to update commission' }, 500);
  }
});

// Get all commissions (for admin)
app.get("/make-server-175b2872/commissions/all", async (c) => {
  try {
    const allCommissions = await kv.getByPrefix('commission:');
    
    // Sort by date (newest first)
    allCommissions.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ commissions: allCommissions });
  } catch (error) {
    console.error('Error fetching all commissions:', error);
    return c.json({ error: 'Failed to fetch commissions' }, 500);
  }
});

// Get platform settings
app.get("/make-server-175b2872/platform/settings", async (c) => {
  try {
    const settings = await kv.get('platform:settings') || {
      monthly_subscription_fee: 499,
      affiliate_commission_percentage: 10,
      ml_insights_enabled: true,
      data_brokerage_enabled: true
    };
    return c.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update platform settings
app.put("/make-server-175b2872/platform/settings", async (c) => {
  try {
    const body = await c.req.json();
    const currentSettings = await kv.get('platform:settings') || {};
    
    const updatedSettings = {
      ...currentSettings,
      ...body,
      updated_at: new Date().toISOString()
    };
    
    await kv.set('platform:settings', updatedSettings);
    
    console.log('✅ Platform settings updated:', updatedSettings);
    
    return c.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============================================
// SEED DATABASE ENDPOINT
// ============================================

app.post("/make-server-175b2872/seed", async (c) => {
  try {
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error('Error seeding database:', error);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});

// Clear and re-seed database endpoint
app.post("/make-server-175b2872/reseed", async (c) => {
  try {
    console.log('🗑️ Clearing old seed data...');
    
    // Clear old menu items (both formats)
    const oldMenuItems = await kv.getByPrefix('menu_item:');
    console.log(`Found ${oldMenuItems.length} old menu items to clear`);
    
    // Use raw Supabase query to delete by prefix pattern
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );
    
    // Delete all menu items
    await supabase
      .from('kv_store_175b2872')
      .delete()
      .like('key', 'menu_item:%');
    
    await supabase
      .from('kv_store_175b2872')
      .delete()
      .like('key', 'menu:%');
    
    console.log('✅ Old menu items cleared');
    
    // Re-seed the database
    console.log('🌱 Re-seeding database...');
    const result = await seedDatabase();
    
    return c.json({ 
      success: true,
      message: 'Database re-seeded successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ Error re-seeding database:', error);
    return c.json({ error: 'Failed to re-seed database' }, 500);
  }
});

// ============================================
// KV-BASED DATA ROUTES (FOR DEMO/SEED DATA)
// ============================================

// Get all businesses from KV store
app.get("/make-server-175b2872/kv/businesses", async (c) => {
  try {
    // Add cache headers for better performance
    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    
    // Pagination parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20'); // Default 20 per page for fast loading
    const offset = (page - 1) * limit;
    
    const businesses = await kv.getByPrefix('business:');
    
    // Filter out businesses that haven't paid their subscription
    const paidBusinesses = businesses.filter((b: any) => 
      b.is_active === true && 
      (b.payment_status === 'paid' || b.subscription_status === 'active')
    );
    
    // Add distance if lat/lng provided
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    
    const businessesWithDistance = paidBusinesses.map((b: any) => {
      if (lat && lng && b.latitude && b.longitude) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          b.latitude,
          b.longitude
        );
        return { ...b, distance };
      }
      return b;
    });
    
    // Sort by distance if location provided
    if (lat && lng) {
      businessesWithDistance.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
    }
    
    // Apply pagination
    const total = businessesWithDistance.length;
    const paginatedData = businessesWithDistance.slice(offset, offset + limit);
    
    return c.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching businesses from KV:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

// Get business by ID from KV store
app.get("/make-server-175b2872/kv/businesses/:id", async (c) => {
  try {
    // Add cache headers
    c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=240');
    
    const id = c.req.param('id');
    
    // Validate business ID format - reject invalid patterns (simple sequential IDs only, max 3 digits)
    if (id.match(/^business-[1-9]\d{0,2}$/)) {
      console.log(`⚠️ Rejected invalid business ID pattern: ${id}`);
      return c.json({ 
        error: 'Business not found',
        message: 'This business ID format is no longer valid. Please use the correct business identifier.'
      }, 404);
    }
    
    console.log(`🔍 Fetching business with ID: ${id}`);
    
    const business = await kv.get(`business:${id}`);
    
    if (!business) {
      console.error(`Business not found: ${id}`);
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Check if business has paid subscription
    if (!business.is_active || (business.payment_status !== 'paid' && business.subscription_status !== 'active')) {
      console.error(`Business subscription not active: ${id}`);
      return c.json({ error: 'Business not available' }, 403);
    }
    
    // Get related data in parallel for faster response
    const [allSpecials, allEvents, oldMenuItems, newMenuItems, reviews] = await Promise.all([
      kv.getByPrefix(`special:${id}:`),
      kv.getByPrefix(`event:`),  // Get all events, then filter by business_id
      kv.getByPrefix(`menu:${id}:`),
      kv.getByPrefix(`menu_item:${id}:`),
      kv.getByPrefix(`review:${id}:`)
    ]);
    
    // Filter events for this business only
    const events = allEvents.filter((event: any) => event.business_id === id);
    
    const menuItems = [...(oldMenuItems || []), ...(newMenuItems || [])];
    
    const response = {
      business: business,
      specials: allSpecials || [],
      events: events || [],
      menu_items: menuItems,
      reviews: reviews || []
    };
    
    console.log(`Successfully fetched business ${id} with ${menuItems.length} menu items, ${allSpecials?.length || 0} specials, ${events?.length || 0} events`);
    
    return c.json(response);
  } catch (error) {
    console.error('Error fetching business from KV:', error);
    return c.json({ error: `Failed to fetch business: ${error.message}` }, 500);
  }
});

// Update business settings
app.put("/make-server-175b2872/kv/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    console.log(`📝 Updating business settings for ${id}:`, body);
    
    const existingBusiness = await kv.get(`business:${id}`);
    if (!existingBusiness) {
      console.error(`❌ Business not found: ${id}`);
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const updatedBusiness = {
      ...existingBusiness,
      name: body.name || existingBusiness.name,
      address: body.address || existingBusiness.address,
      city: body.city || existingBusiness.city,
      phone: body.phone || existingBusiness.phone,
      email: body.email || existingBusiness.email,
      description: body.description || existingBusiness.description,
      logo_url: body.logo_url !== undefined ? body.logo_url : existingBusiness.logo_url,
      cover_image_url: body.cover_image_url !== undefined ? body.cover_image_url : existingBusiness.cover_image_url,
      latitude: body.latitude !== undefined ? body.latitude : existingBusiness.latitude,
      longitude: body.longitude !== undefined ? body.longitude : existingBusiness.longitude,
      opening_hours: body.opening_hours !== undefined ? body.opening_hours : existingBusiness.opening_hours,
      avg_price_min: body.avg_price_min !== undefined ? body.avg_price_min : existingBusiness.avg_price_min,
      avg_price_max: body.avg_price_max !== undefined ? body.avg_price_max : existingBusiness.avg_price_max,
      cuisine_types: body.cuisine_types !== undefined ? body.cuisine_types : existingBusiness.cuisine_types,
      age_groups: body.age_groups !== undefined ? body.age_groups : existingBusiness.age_groups,
      updated_at: new Date().toISOString()
    };
    
    console.log(`✅ Updated business object:`, {
      id,
      cuisine_types: updatedBusiness.cuisine_types,
      age_groups: updatedBusiness.age_groups,
      opening_hours: updatedBusiness.opening_hours ? 'present' : 'missing'
    });
    
    await kv.set(`business:${id}`, updatedBusiness);
    
    console.log(`✅ Business ${id} updated successfully`);
    
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error updating business:', error);
    return c.json({ error: 'Failed to update business' }, 500);
  }
});

// Fix missing fields for existing businesses
app.post("/make-server-175b2872/kv/fix-businesses", async (c) => {
  try {
    const businesses = await kv.getByPrefix('business:');
    let fixedCount = 0;
    
    for (const business of businesses) {
      // Check if business is missing essential fields
      if (!business.latitude || !business.longitude || business.average_rating === undefined) {
        const city = business.city || '';
        const updatedBusiness = {
          ...business,
          business_type: business.business_type || 'restaurant',
          cuisine_types: business.cuisine_types || [],
          latitude: business.latitude || (
            city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton')
              ? -26.1076
              : city.toLowerCase().includes('cape town')
              ? -33.9249
              : city.toLowerCase().includes('durban')
              ? -29.8587
              : -26.1076
          ),
          longitude: business.longitude || (
            city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton')
              ? 28.0567
              : city.toLowerCase().includes('cape town')
              ? 18.4241
              : city.toLowerCase().includes('durban')
              ? 31.0218
              : 28.0567
          ),
          price_range: business.price_range || '$$',
          logo_url: business.logo_url || null,
          cover_image_url: business.cover_image_url || null,
          average_rating: business.average_rating ?? 0,
          total_reviews: business.total_reviews ?? 0,
          total_views: business.total_views ?? 0
        };
        
        await kv.set(`business:${business.id}`, updatedBusiness);
        fixedCount++;
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Fixed ${fixedCount} businesses with missing fields`,
      total_businesses: businesses.length
    });
  } catch (error) {
    console.error('Error fixing businesses:', error);
    return c.json({ error: 'Failed to fix businesses' }, 500);
  }
});

// Upload business logo
app.post("/make-server-175b2872/businesses/:id/upload-logo", async (c) => {
  try {
    const businessId = c.req.param('id');
    
    // Get the form data
    const formData = await c.req.formData();
    const file = formData.get('logo');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 2MB' }, 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-175b2872-logos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${businessId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload logo' }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    // Update business with logo URL
    const business = await kv.get(`business:${businessId}`);
    if (business) {
      business.logo_url = logoUrl;
      business.updated_at = new Date().toISOString();
      await kv.set(`business:${businessId}`, business);
    }

    return c.json({ 
      success: true, 
      logo_url: logoUrl 
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return c.json({ error: 'Failed to upload logo' }, 500);
  }
});

// Upload business cover image
app.post("/make-server-175b2872/businesses/:id/upload-cover", async (c) => {
  try {
    const businessId = c.req.param('id');
    
    // Get the form data
    const formData = await c.req.formData();
    const file = formData.get('cover');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Check file size (max 5MB for cover images)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-175b2872-covers';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    // Upload file
    const fileExt = file.name.split('.').pop();
    const fileName = `${businessId}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload cover image' }, 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const coverImageUrl = urlData.publicUrl;

    // Update business with cover image URL
    const business = await kv.get(`business:${businessId}`);
    if (business) {
      business.cover_image_url = coverImageUrl;
      business.updated_at = new Date().toISOString();
      await kv.set(`business:${businessId}`, business);
    }

    return c.json({ 
      success: true, 
      cover_image_url: coverImageUrl 
    });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return c.json({ error: 'Failed to upload cover image' }, 500);
  }
});

// Geocode address to get coordinates
app.post("/make-server-175b2872/geocode", async (c) => {
  try {
    const body = await c.req.json();
    const { address, city, country } = body;
    
    if (!address || !city) {
      return c.json({ error: 'Address and city are required' }, 400);
    }
    
    // Build full address string
    const fullAddress = `${address}, ${city}, ${country || 'South Africa'}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      // Return default coordinates based on city if API key is missing
      return getDefaultCoordinates(city);
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return c.json({
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address
      });
    } else if (data.status === 'ZERO_RESULTS') {
      console.log('No geocoding results found, using default coordinates for city');
      return getDefaultCoordinates(city);
    } else {
      console.error('Geocoding error:', data.status, data.error_message);
      return getDefaultCoordinates(city);
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    // Fallback to default coordinates
    const body = await c.req.json();
    return getDefaultCoordinates(body.city);
  }
});

// Helper function to get default coordinates based on city
function getDefaultCoordinates(city: string) {
  const cityLower = city?.toLowerCase() || '';
  
  let latitude, longitude;
  
  if (cityLower.includes('johannesburg') || cityLower.includes('sandton') || cityLower.includes('rosebank')) {
    latitude = -26.1076;
    longitude = 28.0567;
  } else if (cityLower.includes('cape town') || cityLower.includes('capetown')) {
    latitude = -33.9249;
    longitude = 18.4241;
  } else if (cityLower.includes('durban')) {
    latitude = -29.8587;
    longitude = 31.0218;
  } else if (cityLower.includes('pretoria')) {
    latitude = -25.7479;
    longitude = 28.2293;
  } else if (cityLower.includes('port elizabeth') || cityLower.includes('gqeberha')) {
    latitude = -33.9608;
    longitude = 25.6022;
  } else if (cityLower.includes('bloemfontein')) {
    latitude = -29.1211;
    longitude = 26.2140;
  } else {
    // Default to Johannesburg
    latitude = -26.1076;
    longitude = 28.0567;
  }
  
  return c.json({
    success: true,
    latitude,
    longitude,
    formatted_address: `${city}, South Africa`,
    note: 'Using default city coordinates'
  });
}

// Get all specials from KV store
app.get("/make-server-175b2872/kv/specials", async (c) => {
  try {
    // Add cache headers
    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    
    // Use raw query to get both keys and values
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );
    
    const { data: specialsData, error } = await supabase
      .from('kv_store_175b2872')
      .select('key, value')
      .like('key', 'special:%');
    
    if (error) {
      throw error;
    }
    
    const businesses = await kv.getByPrefix('business:');
    
    // Create business lookup
    const businessMap = new Map();
    businesses.forEach((b: any) => {
      businessMap.set(b.id, b);
    });
    
    // Extract ID from key and attach business data to specials
    const specialsWithBusiness = (specialsData || []).map((item: any) => ({
      ...item.value,
      id: item.value.id || item.key, // Use existing ID or fall back to key
      business: businessMap.get(item.value.business_id)
    }));
    
    return c.json({ specials: specialsWithBusiness });
  } catch (error) {
    console.error('Error fetching specials from KV:', error);
    return c.json({ error: 'Failed to fetch specials' }, 500);
  }
});

// Get all events from KV store
app.get("/make-server-175b2872/kv/events", async (c) => {
  try {
    // Shorter cache for events so updates appear quickly
    c.header('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    
    const allEvents = await kv.getByPrefix('event:');
    const businesses = await kv.getByPrefix('business:');
    
    // Create business lookup
    const businessMap = new Map();
    businesses.forEach((b: any) => {
      businessMap.set(b.id, b);
    });
    
    // Attach business data to events
    const eventsWithBusiness = allEvents.map((event: any) => ({
      ...event,
      business: businessMap.get(event.business_id)
    }));
    
    return c.json({ events: eventsWithBusiness });
  } catch (error) {
    console.error('Error fetching events from KV:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Get reviews for a specific business
app.get("/make-server-175b2872/kv/reviews/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    const allReviews = await kv.getByPrefix(`review:${businessId}:`);
    
    // Sort by date (newest first)
    const sortedReviews = allReviews.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ reviews: sortedReviews });
  } catch (error) {
    console.error('Error fetching reviews from KV:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Submit a new review
app.post("/make-server-175b2872/kv/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, user_name, rating, comment, user_phone, user_email } = body;
    
    // Validation
    if (!business_id || !user_name || !rating || !comment) {
      console.error('❌ Review submission validation failed:', { business_id, user_name, rating, comment });
      return c.json({ 
        error: 'Missing required fields',
        details: 'business_id, user_name, rating, and comment are required' 
      }, 400);
    }

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    // Generate unique review ID
    const reviewId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reviewKey = `review:${business_id}:${reviewId}`;
    
    // Create review object
    const review = {
      id: reviewId,
      business_id,
      customer_name: user_name,
      user_name,
      rating: Number(rating),
      comment,
      customer_mobile: user_phone || null,
      user_phone: user_phone || null,
      customer_email: user_email || null,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      helpful_count: 0,
      source: user_phone ? 'whatsapp' : 'app'
    };
    
    console.log('💾 Saving review:', reviewKey, review);
    
    // Save review
    await kv.set(reviewKey, review);
    
    // Update business rating
    const business = await kv.get(`business:${business_id}`);
    if (business) {
      const allReviews = await kv.getByPrefix(`review:${business_id}:`);
      const totalReviews = allReviews.length;
      const averageRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews;
      
      business.total_reviews = totalReviews;
      business.average_rating = Math.round(averageRating * 10) / 10;
      
      await kv.set(`business:${business_id}`, business);
      console.log(`✅ Updated business ${business_id} rating: ${business.average_rating} (${totalReviews} reviews)`);
    }
    
    return c.json({ 
      success: true, 
      review,
      message: 'Review submitted successfully' 
    });
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    return c.json({ 
      error: 'Failed to submit review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Send WhatsApp review request
app.post("/make-server-175b2872/kv/send-review-request", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, customer_name, customer_phone } = body;
    
    if (!business_id || !customer_name || !customer_phone) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get business details
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = customer_phone.replace(/[^0-9+]/g, '');
    
    // Generate review link - includes business ID and customer info
    const reviewLink = `${c.req.header('origin') || 'https://vibespot.com'}/review/${business_id}?name=${encodeURIComponent(customer_name)}&phone=${encodeURIComponent(cleanPhone)}`;
    
    // Create WhatsApp message
    const message = `Hi ${customer_name}! 👋\n\nThank you for visiting ${business.name}! We'd love to hear about your experience.\n\nPlease take a moment to leave us a review:\n${reviewLink}\n\nYour feedback helps us serve you better! 🌟`;
    
    // Generate WhatsApp link
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Log the request
    const requestLog = {
      business_id,
      customer_name,
      customer_phone: cleanPhone,
      sent_at: new Date().toISOString()
    };
    
    const logKey = `review_request:${business_id}:${Date.now()}`;
    await kv.set(logKey, requestLog);
    
    console.log('📱 WhatsApp review request generated:', { business: business.name, customer: customer_name });
    
    return c.json({ 
      success: true,
      whatsapp_link: whatsappLink,
      message: 'Review request link generated'
    });
  } catch (error) {
    console.error('❌ Error generating review request:', error);
    return c.json({ error: 'Failed to generate review request' }, 500);
  }
});

// Reply to a review and send WhatsApp notification
app.post("/make-server-175b2872/kv/reviews/:reviewId/reply", async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const body = await c.req.json();
    const { business_id, reply_text } = body;
    
    if (!business_id || !reply_text) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get the review
    const reviewKey = `review:${business_id}:${reviewId}`;
    const review = await kv.get(reviewKey);
    
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    // Get business details
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Update review with reply
    const updatedReview = {
      ...review,
      business_reply: reply_text,
      business_reply_date: new Date().toISOString()
    };
    
    await kv.set(reviewKey, updatedReview);
    
    console.log('✅ Review reply saved:', { reviewId, business: business.name });
    
    // Send WhatsApp notification if customer has a mobile number
    let whatsappLink = null;
    if (review.customer_mobile || review.user_phone) {
      const customerPhone = review.customer_mobile || review.user_phone;
      const cleanPhone = customerPhone.replace(/[^0-9+]/g, '');
      const customerName = review.customer_name || review.user_name || 'Valued Customer';
      
      // Create WhatsApp message
      const message = `Hi ${customerName}! 👋\n\n${business.name} has replied to your review:\n\n"${reply_text}"\n\nThank you for your feedback! 🌟`;
      
      // Generate WhatsApp link
      whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      // Log the notification
      const notificationLog = {
        review_id: reviewId,
        business_id,
        customer_phone: cleanPhone,
        customer_name: customerName,
        sent_at: new Date().toISOString(),
        type: 'review_reply'
      };
      
      const logKey = `notification:${business_id}:${Date.now()}`;
      await kv.set(logKey, notificationLog);
      
      console.log('📱 WhatsApp notification generated for review reply:', { customer: customerName, phone: cleanPhone });
    }
    
    return c.json({ 
      success: true,
      review: updatedReview,
      whatsapp_link: whatsappLink,
      message: whatsappLink 
        ? 'Reply saved and WhatsApp notification link generated' 
        : 'Reply saved (no phone number available for notification)'
    });
  } catch (error) {
    console.error('❌ Error replying to review:', error);
    return c.json({ 
      error: 'Failed to reply to review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get AI recommendations from KV data
app.get("/make-server-175b2872/kv/recommendations", async (c) => {
  try {
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    const useAdvancedAI = c.req.query('advanced') === 'true'; // Default to basic (disabled advanced to prevent timeouts)
    
    // Get all specials and businesses
    const allSpecials = await kv.getByPrefix('special:');
    const businesses = await kv.getByPrefix('business:');
    
    // Use advanced AI only if explicitly requested (with timeout protection)
    if (useAdvancedAI) {
      try {
        console.log('🤖 Advanced AI requested - loading with timeout protection...');
        
        // Add 5-second timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Advanced AI timeout after 5s')), 5000)
        );
        
        const aiPromise = (async () => {
          const { generateAdvancedRecommendations } = await import('./advancedAI.ts');
          
          const context = {
            userLocation: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
            currentTime: new Date()
          };
          
          return await generateAdvancedRecommendations(
            allSpecials,
            businesses,
            context,
            kv
          );
        })();
        
        const advancedRecs = await Promise.race([aiPromise, timeoutPromise]);
        console.log('✅ Advanced AI recommendations generated successfully');
        return c.json(advancedRecs);
      } catch (error) {
        console.warn('⚠️ Advanced AI failed, using basic recommendations:', error instanceof Error ? error.message : 'Unknown error');
        // Fall through to basic AI
      }
    }
    
    // BASIC AI (Fallback)
    console.log('📊 Using Basic AI for recommendations');
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    // Determine time of day
    let timeOfDay = 'dinner';
    if (currentHour >= 6 && currentHour < 11) timeOfDay = 'breakfast';
    else if (currentHour >= 11 && currentHour < 15) timeOfDay = 'lunch';
    else if (currentHour >= 15 && currentHour < 18) timeOfDay = 'afternoon';
    else if (currentHour >= 22) timeOfDay = 'late-night';
    
    // Determine if weekend
    const isWeekend = currentDay === 0 || currentDay === 6;
    
    // Create business lookup
    const businessMap = new Map();
    businesses.forEach((b: any) => {
      businessMap.set(b.id, b);
    });
    
    // Score and rank specials
    const scoredRecommendations = allSpecials.map((special: any) => {
      let score = 0;
      const business = businessMap.get(special.business_id);
      
      // Time-based scoring
      if (timeOfDay === 'lunch' && special.title?.toLowerCase().includes('lunch')) score += 30;
      if (timeOfDay === 'dinner' && special.title?.toLowerCase().includes('dinner')) score += 30;
      if (timeOfDay === 'breakfast' && special.title?.toLowerCase().includes('breakfast')) score += 30;
      if (currentHour >= 17 && currentHour <= 19 && special.title?.toLowerCase().includes('happy hour')) score += 40;
      
      // Day-based scoring
      if (isWeekend && special.title?.toLowerCase().includes('weekend')) score += 25;
      if (!isWeekend && (special.title?.toLowerCase().includes('weekday') || special.title?.toLowerCase().includes('business'))) score += 25;
      
      // Popularity scoring
      score += Math.min((special.view_count || 0) / 10, 20);
      
      // Rating scoring
      if (business?.average_rating) {
        score += (business.average_rating / 5) * 20;
      }
      
      // Distance scoring
      if (lat && lng && business?.latitude && business?.longitude) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.latitude,
          business.longitude
        );
        if (distance < 5) score += 15;
        else if (distance < 10) score += 10;
        else if (distance < 20) score += 5;
      }
      
      return {
        id: special.id || `${special.business_id}-${special.title}-${Date.now()}`,
        type: 'special',
        title: special.title,
        venue: business?.name || 'Unknown',
        reason: generateRecommendationReason(timeOfDay, isWeekend, score, special),
        confidence: Math.min(Math.round(score), 100),
        image: special.image_url || business?.cover_image_url || '',
        tags: generateTags(special, score, timeOfDay)
      };
    });
    
    // Sort by score and return top 3
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    return c.json(topRecommendations);
  } catch (error) {
    console.error('Error generating recommendations from KV:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-175b2872/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to list all KV keys
app.get("/make-server-175b2872/debug/list-keys", async (c) => {
  try {
    const businesses = await kv.getByPrefix('business:');
    const specials = await kv.getByPrefix('special:');
    const events = await kv.getByPrefix('event:');
    
    return c.json({
      total_businesses: businesses.length,
      total_specials: specials.length,
      total_events: events.length,
      business_ids: businesses.map((b: any) => ({ id: b.id, name: b.name, city: b.city, latitude: b.latitude, longitude: b.longitude }))
    });
  } catch (error) {
    console.error('Error listing keys:', error);
    return c.json({ error: 'Failed to list keys' }, 500);
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Get analytics data (revenue, bookings, views over time)
app.get("/make-server-175b2872/kv/analytics", async (c) => {
  try {
    const analytics = await kv.getByPrefix('analytics:');
    return c.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get popular times data
app.get("/make-server-175b2872/kv/popular-times", async (c) => {
  try {
    const popularTimes = await kv.getByPrefix('popular-times:');
    return c.json(popularTimes);
  } catch (error) {
    console.error('Error fetching popular times:', error);
    return c.json({ error: 'Failed to fetch popular times' }, 500);
  }
});

// Get cuisine stats
app.get("/make-server-175b2872/kv/cuisine-stats", async (c) => {
  try {
    const cuisineStats = await kv.getByPrefix('cuisine-stats:');
    return c.json(cuisineStats);
  } catch (error) {
    console.error('Error fetching cuisine stats:', error);
    return c.json({ error: 'Failed to fetch cuisine stats' }, 500);
  }
});

// Get demographics data
app.get("/make-server-175b2872/kv/demographics", async (c) => {
  try {
    const demographics = await kv.getByPrefix('demographics:');
    return c.json(demographics);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    return c.json({ error: 'Failed to fetch demographics' }, 500);
  }
});

// Get rating trends
app.get("/make-server-175b2872/kv/rating-trends", async (c) => {
  try {
    const ratingTrends = await kv.getByPrefix('rating-trends:');
    return c.json(ratingTrends);
  } catch (error) {
    console.error('Error fetching rating trends:', error);
    return c.json({ error: 'Failed to fetch rating trends' }, 500);
  }
});

// ============================================
// EVENT CRUD ROUTES
// ============================================

// Create a new event
app.post("/make-server-175b2872/kv/events", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.business_id) {
      return c.json({ error: 'business_id is required' }, 400);
    }
    
    // Verify the business exists
    const business = await kv.get(`business:${body.business_id}`);
    if (!business) {
      return c.json({ error: `Business not found: ${body.business_id}` }, 404);
    }
    
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const eventData = {
      id: eventId,
      business_id: body.business_id,
      title: body.title,
      description: body.description || '',
      event_date: body.event_date,
      event_time: body.event_time,
      location: body.location || '',
      interested_count: 0,
      is_active: true,
      image_url: body.image_url || null,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`event:${eventId}`, eventData);
    
    // Create notifications for users who favorited this business
    try {
      const allFavorites = await kv.getByPrefix('favorite:');
      const usersToNotify = allFavorites
        .filter((fav: any) => fav.business_id === body.business_id)
        .map((fav: any) => fav.user_id);
      
      if (usersToNotify.length > 0) {
        console.log(`📬 Creating notifications for ${usersToNotify.length} users who favorited ${business.name}`);
        
        for (const userId of usersToNotify) {
          const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const notification = {
            id: notificationId,
            user_id: userId,
            business_id: body.business_id,
            business_name: business.name,
            business_logo: business.logo_url || null,
            type: 'event',
            title: '🎪 New Event Announced!',
            message: `${business.name} is hosting: ${body.title}`,
            event_id: eventId,
            image_url: body.image_url || business.cover_image_url || null,
            created_at: new Date().toISOString(),
            read: false
          };
          
          await kv.set(`notification:${userId}:${notificationId}`, notification);
        }
        
        console.log(`✅ Created ${usersToNotify.length} notifications`);
      }
    } catch (notifError) {
      console.error('⚠️ Error creating notifications (non-blocking):', notifError);
      // Don't fail the event creation if notifications fail
    }
    
    return c.json({ success: true, event: eventData });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update an event
app.put("/make-server-175b2872/kv/events/:id", async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    
    console.log('=== Server: Update Event ===');
    console.log('Received eventId from URL:', eventId);
    console.log('Looking for key:', `event:${eventId}`);
    console.log('Request body:', body);
    
    const existingEvent = await kv.get(`event:${eventId}`);
    console.log('Existing event found:', existingEvent ? 'YES' : 'NO');
    
    if (!existingEvent) {
      // Try to list all events to debug
      const allEvents = await kv.getByPrefix('event:');
      console.log('Total events in database:', allEvents.length);
      console.log('All event IDs in database:', allEvents.map((e: any) => e.id));
      console.log('Looking for event with ID:', eventId);
      
      return c.json({ 
        error: 'Event not found',
        debug: {
          requestedId: eventId,
          availableIds: allEvents.map((e: any) => e.id),
          totalEvents: allEvents.length
        }
      }, 404);
    }
    
    const updatedEvent = {
      ...existingEvent,
      title: body.title || existingEvent.title,
      description: body.description || existingEvent.description,
      event_date: body.event_date || existingEvent.event_date,
      event_time: body.event_time || existingEvent.event_time,
      location: body.location || existingEvent.location,
      image_url: body.image_url || existingEvent.image_url,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`event:${eventId}`, updatedEvent);
    console.log('Event updated successfully');
    
    return c.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({ error: 'Failed to update event', details: error.message }, 500);
  }
});

// Delete an event
app.delete("/make-server-175b2872/kv/events/:id", async (c) => {
  try {
    const eventId = c.req.param('id');
    
    const existingEvent = await kv.get(`event:${eventId}`);
    if (!existingEvent) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    await kv.del(`event:${eventId}`);
    
    return c.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// ============================================
// SPECIAL CRUD ROUTES
// ============================================

// Create a new special
app.post("/make-server-175b2872/kv/specials", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('📝 Creating special:', body);
    
    // Validate required fields
    if (!body.business_id) {
      return c.json({ error: 'business_id is required' }, 400);
    }
    
    if (!body.title || !body.start_date || !body.end_date) {
      return c.json({ error: 'title, start_date, and end_date are required' }, 400);
    }
    
    // Either price or discount_percentage must be provided
    if (!body.price && !body.discount_percentage) {
      return c.json({ error: 'Either price or discount_percentage is required' }, 400);
    }
    
    // Verify the business exists
    const business = await kv.get(`business:${body.business_id}`);
    if (!business) {
      return c.json({ error: `Business not found: ${body.business_id}` }, 404);
    }
    
    const specialId = `special-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const specialData = {
      id: specialId,
      business_id: body.business_id,
      title: body.title,
      description: body.description || '',
      price: body.price || '',
      discount_percentage: body.discount_percentage || null,
      start_date: body.start_date,
      end_date: body.end_date,
      time_start: body.time_start || null,
      time_end: body.time_end || null,
      days_of_week: body.days_of_week || null,
      image_url: body.image_url || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      view_count: body.view_count || 0,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`special:${specialId}`, specialData);
    
    console.log('✅ Special created successfully:', specialId);
    
    // Create notifications for users who favorited this business
    try {
      const allFavorites = await kv.getByPrefix('favorite:');
      const usersToNotify = allFavorites
        .filter((fav: any) => fav.business_id === body.business_id)
        .map((fav: any) => fav.user_id);
      
      if (usersToNotify.length > 0) {
        console.log(`📬 Creating notifications for ${usersToNotify.length} users who favorited ${business.name}`);
        
        for (const userId of usersToNotify) {
          const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const notification = {
            id: notificationId,
            user_id: userId,
            business_id: body.business_id,
            business_name: business.name,
            business_logo: business.logo_url || null,
            type: 'special',
            title: '🎉 New Special Available!',
            message: `${business.name} posted: ${body.title}`,
            special_id: specialId,
            image_url: body.image_url || business.cover_image_url || null,
            created_at: new Date().toISOString(),
            read: false
          };
          
          await kv.set(`notification:${userId}:${notificationId}`, notification);
        }
        
        console.log(`✅ Created ${usersToNotify.length} notifications`);
      }
    } catch (notifError) {
      console.error('⚠️ Error creating notifications (non-blocking):', notifError);
      // Don't fail the special creation if notifications fail
    }
    
    return c.json({ 
      success: true, 
      message: 'Special created successfully',
      special: specialData
    });
  } catch (error) {
    console.error('❌ Error creating special:', error);
    return c.json({ error: 'Failed to create special', details: error.message }, 500);
  }
});

// Update a special
app.put("/make-server-175b2872/kv/specials/:id", async (c) => {
  try {
    const specialId = c.req.param('id');
    const body = await c.req.json();
    
    console.log(`📝 Updating special ${specialId}:`, JSON.stringify(body, null, 2));
    
    const existingSpecial = await kv.get(`special:${specialId}`);
    if (!existingSpecial) {
      console.error(`❌ Special not found: ${specialId}`);
      return c.json({ error: 'Special not found' }, 404);
    }
    
    console.log(`📋 Existing special data:`, JSON.stringify(existingSpecial, null, 2));
    
    // Validate business exists if business_id is being updated
    if (body.business_id && body.business_id !== existingSpecial.business_id) {
      const business = await kv.get(`business:${body.business_id}`);
      if (!business) {
        console.error(`❌ Business not found: ${body.business_id}`);
        return c.json({ error: `Business not found: ${body.business_id}` }, 404);
      }
    }
    
    const updatedSpecialData = {
      ...existingSpecial,
      title: body.title !== undefined ? body.title : existingSpecial.title,
      description: body.description !== undefined ? body.description : existingSpecial.description,
      price: body.price !== undefined ? body.price : existingSpecial.price,
      discount_percentage: body.discount_percentage !== undefined ? body.discount_percentage : existingSpecial.discount_percentage,
      start_date: body.start_date !== undefined ? body.start_date : existingSpecial.start_date,
      end_date: body.end_date !== undefined ? body.end_date : existingSpecial.end_date,
      time_start: body.time_start !== undefined ? body.time_start : existingSpecial.time_start,
      time_end: body.time_end !== undefined ? body.time_end : existingSpecial.time_end,
      days_of_week: body.days_of_week !== undefined ? body.days_of_week : existingSpecial.days_of_week,
      image_url: body.image_url !== undefined ? body.image_url : existingSpecial.image_url,
      is_active: body.is_active !== undefined ? body.is_active : existingSpecial.is_active,
      business_id: body.business_id !== undefined ? body.business_id : existingSpecial.business_id,
      updated_at: new Date().toISOString()
    };
    
    console.log(`💾 Saving updated special:`, JSON.stringify(updatedSpecialData, null, 2));
    
    await kv.set(`special:${specialId}`, updatedSpecialData);
    
    console.log('✅ Special updated successfully:', specialId);
    
    return c.json({ 
      success: true, 
      message: 'Special updated successfully',
      special: updatedSpecialData
    });
  } catch (error) {
    console.error('❌ Error updating special:', error);
    return c.json({ error: 'Failed to update special', details: error.message }, 500);
  }
});

// Delete a special
app.delete("/make-server-175b2872/kv/specials/:id", async (c) => {
  try {
    const specialId = c.req.param('id');
    
    const existingSpecial = await kv.get(`special:${specialId}`);
    if (!existingSpecial) {
      return c.json({ error: 'Special not found' }, 404);
    }
    
    await kv.del(`special:${specialId}`);
    
    return c.json({ success: true, message: 'Special deleted successfully' });
  } catch (error) {
    console.error('Error deleting special:', error);
    return c.json({ error: 'Failed to delete special' }, 500);
  }
});

// Increment special view count
app.post("/make-server-175b2872/kv/specials/:id/increment-view", async (c) => {
  try {
    const specialId = c.req.param('id');
    console.log(`👀 Incrementing view count for special: ${specialId}`);
    
    const special = await kv.get(`special:${specialId}`);
    if (!special) {
      // Silently fail for placeholder specials - not an error
      console.log(`ℹ️ Special not found (likely a placeholder): ${specialId}`);
      return c.json({ error: 'Special not found' }, 404);
    }
    
    const updatedSpecial = {
      ...special,
      view_count: (special.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString()
    };
    
    await kv.set(`special:${specialId}`, updatedSpecial);
    
    console.log(`✅ View count incremented to ${updatedSpecial.view_count} for special: ${specialId}`);
    
    return c.json({ 
      success: true, 
      view_count: updatedSpecial.view_count 
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return c.json({ error: 'Failed to increment view count' }, 500);
  }
});

// ============================================
// MENU ITEM CRUD ROUTES
// ============================================

// Get all menu items from KV store
app.get("/make-server-175b2872/kv/menu_items", async (c) => {
  try {
    // Support both old 'menu:' and new 'menu_item:' formats
    const oldMenuItems = await kv.getByPrefix('menu:');
    const newMenuItems = await kv.getByPrefix('menu_item:');
    
    // Ensure all menu items have an ID field
    // Extract ID from the stored data or generate a warning
    const processedMenuItems = [...oldMenuItems, ...newMenuItems].map((item: any) => {
      // If item already has an ID, return as-is
      if (item.id) {
        return item;
      }
      
      // If no ID, this is likely old data - log warning
      console.warn('Menu item missing ID field:', item);
      
      // Try to generate a temporary ID from the item data
      // This should not happen with properly stored items
      const tempId = `temp-${item.business_id}-${item.name?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
      return {
        ...item,
        id: tempId
      };
    });
    
    return c.json({ menu_items: processedMenuItems });
  } catch (error) {
    console.error('Error fetching menu items from KV:', error);
    return c.json({ error: 'Failed to fetch menu items' }, 500);
  }
});

// Create a new menu item
app.post("/make-server-175b2872/kv/menu_items", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.business_id) {
      return c.json({ error: 'business_id is required' }, 400);
    }
    
    // Verify the business exists
    const business = await kv.get(`business:${body.business_id}`);
    if (!business) {
      return c.json({ error: `Business not found: ${body.business_id}` }, 404);
    }
    
    const menuItemId = `menu-item-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const menuItemData = {
      id: menuItemId,
      business_id: body.business_id,
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      category: body.category,
      is_available: true,
      image_url: body.image_url || null,
      created_at: new Date().toISOString()
    };
    
    // Store with business_id in key for easy retrieval: menu_item:{business_id}:{id}
    await kv.set(`menu_item:${body.business_id}:${menuItemId}`, menuItemData);
    
    return c.json({ success: true, menu_item: menuItemData });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return c.json({ error: 'Failed to create menu item' }, 500);
  }
});

// Update a menu item
app.put("/make-server-175b2872/kv/menu_items/:id", async (c) => {
  try {
    const menuItemId = c.req.param('id');
    const body = await c.req.json();
    
    console.log(`Updating menu item ${menuItemId}:`, body);
    
    // Try to find the menu item with both old and new formats
    let existingMenuItem = await kv.get(`menu_item:${menuItemId}`);
    let keyToUse = `menu_item:${menuItemId}`;
    
    // If not found, try with business_id prefix
    if (!existingMenuItem && body.business_id) {
      existingMenuItem = await kv.get(`menu_item:${body.business_id}:${menuItemId}`);
      keyToUse = `menu_item:${body.business_id}:${menuItemId}`;
    }
    
    if (!existingMenuItem) {
      console.error(`Menu item not found: ${menuItemId}`);
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    // Update menu item data
    const updatedMenuItem = {
      ...existingMenuItem,
      name: body.name !== undefined ? body.name : existingMenuItem.name,
      description: body.description !== undefined ? body.description : existingMenuItem.description,
      price: body.price !== undefined ? parseFloat(body.price) : existingMenuItem.price,
      category: body.category !== undefined ? body.category : existingMenuItem.category,
      is_available: body.is_available !== undefined ? body.is_available : existingMenuItem.is_available,
      image_url: body.image_url !== undefined ? body.image_url : existingMenuItem.image_url,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(keyToUse, updatedMenuItem);
    
    console.log(`Successfully updated menu item ${menuItemId}`);
    return c.json({ success: true, menu_item: updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return c.json({ error: 'Failed to update menu item' }, 500);
  }
});

// Delete a menu item
app.delete("/make-server-175b2872/kv/menu_items/:id", async (c) => {
  try {
    const menuItemId = c.req.param('id');
    
    console.log(`Deleting menu item ${menuItemId}`);
    
    // Try to find the menu item with both formats
    let existingMenuItem = await kv.get(`menu_item:${menuItemId}`);
    let keyToDelete = `menu_item:${menuItemId}`;
    
    // If not found, search by prefix to find the item
    if (!existingMenuItem) {
      const allMenuItems = await kv.getByPrefix('menu_item:');
      existingMenuItem = allMenuItems.find((item: any) => item.id === menuItemId);
      
      if (existingMenuItem) {
        // Reconstruct the key with business_id
        keyToDelete = `menu_item:${existingMenuItem.business_id}:${menuItemId}`;
      }
    }
    
    if (!existingMenuItem) {
      console.error(`Menu item not found: ${menuItemId}`);
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    // Delete the menu item
    await kv.del(keyToDelete);
    
    console.log(`Successfully deleted menu item ${menuItemId}`);
    return c.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return c.json({ error: 'Failed to delete menu item' }, 500);
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get platform statistics
app.get("/make-server-175b2872/admin/stats", async (c) => {
  try {
    console.log('📊 Fetching admin platform stats...');
    
    // Get all data
    const businesses = await kv.getByPrefix('business:');
    const menuItems = await kv.getByPrefix('menu_item:');
    const specials = await kv.getByPrefix('special:');
    const events = await kv.getByPrefix('event:');
    const reviews = await kv.getByPrefix('review:');
    const payments = await kv.getByPrefix('payment:');
    
    // Calculate statistics
    const activeBusinesses = businesses.filter((b: any) => b.status === 'approved').length;
    const pendingBusinesses = businesses.filter((b: any) => b.status === 'pending').length;
    const suspendedBusinesses = businesses.filter((b: any) => b.status === 'suspended').length;
    
    // Calculate revenue
    const completedPayments = payments.filter((p: any) => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    // Calculate monthly revenue (payments from current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyPayments = completedPayments.filter((p: any) => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const failedPayments = payments.filter((p: any) => p.status === 'failed').length;
    
    const stats = {
      total_businesses: businesses.length,
      active_businesses: activeBusinesses,
      pending_businesses: pendingBusinesses,
      suspended_businesses: suspendedBusinesses,
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,
      total_payments: payments.length,
      failed_payments: failedPayments,
      total_menu_items: menuItems.length,
      total_specials: specials.length,
      total_events: events.length,
      total_reviews: reviews.length
    };
    
    console.log('✅ Admin stats:', stats);
    return c.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch admin stats' }, 500);
  }
});

// Get all businesses (admin view)
app.get("/make-server-175b2872/admin/businesses", async (c) => {
  try {
    console.log('📋 Fetching all businesses for admin...');
    
    const businesses = await kv.getByPrefix('business:');
    
    // Enrich with payment data
    const payments = await kv.getByPrefix('payment:');
    const businessesWithRevenue = businesses.map((business: any) => {
      const businessPayments = payments.filter((p: any) => 
        p.business_id === business.id && p.status === 'completed'
      );
      const totalRevenue = businessPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      
      return {
        ...business,
        total_revenue: totalRevenue,
        payment_count: businessPayments.length
      };
    });
    
    // Sort by created_at (newest first)
    businessesWithRevenue.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    console.log(`✅ Found ${businessesWithRevenue.length} businesses`);
    return c.json({ success: true, businesses: businessesWithRevenue });
  } catch (error) {
    console.error('❌ Error fetching businesses:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

// Get all payments (admin view)
app.get("/make-server-175b2872/admin/payments", async (c) => {
  try {
    console.log('💳 Fetching all payments for admin...');
    
    const payments = await kv.getByPrefix('payment:');
    const businesses = await kv.getByPrefix('business:');
    
    // Create business lookup map
    const businessMap = new Map();
    businesses.forEach((b: any) => {
      businessMap.set(b.id, b);
    });
    
    // Enrich payments with business names
    const paymentsWithBusinessNames = payments.map((payment: any) => {
      const business = businessMap.get(payment.business_id);
      return {
        ...payment,
        business_name: business?.business_name || 'Unknown Business'
      };
    });
    
    // Sort by date (newest first)
    paymentsWithBusinessNames.sort((a: any, b: any) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
    
    console.log(`✅ Found ${paymentsWithBusinessNames.length} payments`);
    return c.json({ success: true, payments: paymentsWithBusinessNames });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// Approve business
app.post("/make-server-175b2872/admin/businesses/:id/approve", async (c) => {
  try {
    const businessId = c.req.param('id');
    console.log(`✅ Approving business: ${businessId}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const updatedBusiness = {
      ...business,
      status: 'approved',
      approved_at: new Date().toISOString()
    };
    
    await kv.set(`business:${businessId}`, updatedBusiness);
    
    console.log(`✅ Business approved: ${businessId}`);
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error approving business:', error);
    return c.json({ error: 'Failed to approve business' }, 500);
  }
});

// Suspend business
app.post("/make-server-175b2872/admin/businesses/:id/suspend", async (c) => {
  try {
    const businessId = c.req.param('id');
    console.log(`🚫 Suspending business: ${businessId}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const updatedBusiness = {
      ...business,
      status: 'suspended',
      suspended_at: new Date().toISOString()
    };
    
    await kv.set(`business:${businessId}`, updatedBusiness);
    
    console.log(`✅ Business suspended: ${businessId}`);
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error suspending business:', error);
    return c.json({ error: 'Failed to suspend business' }, 500);
  }
});

// Delete business
app.post("/make-server-175b2872/admin/businesses/:id/delete", async (c) => {
  try {
    const businessId = c.req.param('id');
    console.log(`🗑️ Deleting business: ${businessId}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Delete business
    await kv.del(`business:${businessId}`);
    
    // Delete associated data
    const menuItems = await kv.getByPrefix(`menu_item:`);
    const businessMenuItems = menuItems.filter((item: any) => item.business_id === businessId);
    for (const item of businessMenuItems) {
      await kv.del(`menu_item:${item.id}`);
    }
    
    const specials = await kv.getByPrefix('special:');
    const businessSpecials = specials.filter((s: any) => s.business_id === businessId);
    for (const special of businessSpecials) {
      await kv.del(`special:${special.id}`);
    }
    
    const events = await kv.getByPrefix('event:');
    const businessEvents = events.filter((e: any) => e.business_id === businessId);
    for (const event of businessEvents) {
      await kv.del(`event:${event.id}`);
    }
    
    console.log(`✅ Business and all associated data deleted: ${businessId}`);
    return c.json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting business:', error);
    return c.json({ error: 'Failed to delete business' }, 500);
  }
});

// ============================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================

// Get all businesses for admin
app.get("/make-server-175b2872/admin/businesses", async (c) => {
  try {
    console.log('📊 Admin: Fetching all businesses');
    
    const businesses = await kv.getByPrefix('business:');
    
    // Enrich businesses with stats
    const enrichedBusinesses = await Promise.all(businesses.map(async (business: any) => {
      // Get menu items count
      const menuItems = await kv.getByPrefix('menu_item:');
      const businessMenuItems = menuItems.filter((item: any) => item.business_id === business.id);
      
      // Get specials count
      const specials = await kv.getByPrefix('special:');
      const businessSpecials = specials.filter((s: any) => s.business_id === business.id);
      
      // Get reviews
      const reviews = await kv.getByPrefix(`review:${business.id}:`);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;
      
      return {
        ...business,
        total_menu_items: businessMenuItems.length,
        total_specials: businessSpecials.length,
        total_reviews: reviews.length,
        rating: avgRating,
        total_revenue: Math.random() * 50000 + 10000, // Simulated
        total_orders: Math.floor(Math.random() * 500) + 50, // Simulated
        is_active: business.status !== 'suspended'
      };
    }));
    
    console.log(`✅ Found ${enrichedBusinesses.length} businesses`);
    return c.json({ businesses: enrichedBusinesses });
  } catch (error) {
    console.error('❌ Error fetching admin businesses:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

// Get platform statistics
app.get("/make-server-175b2872/admin/stats", async (c) => {
  try {
    console.log('📊 Admin: Fetching platform stats');
    
    const businesses = await kv.getByPrefix('business:');
    const payments = await kv.getByPrefix('payment:');
    const reviews = await kv.getByPrefix('review:');
    const specials = await kv.getByPrefix('special:');
    const events = await kv.getByPrefix('event:');
    
    // Current month calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Subscription stats
    const paidBusinesses = businesses.filter((b: any) => 
      b.payment_status === 'paid' || b.subscription_status === 'active'
    );
    const pendingPaymentBusinesses = businesses.filter((b: any) => 
      b.payment_status === 'pending' || b.subscription_status === 'pending_payment'
    );
    const overdueBusinesses = businesses.filter((b: any) => {
      if (b.next_payment_due) {
        return new Date(b.next_payment_due) < now && b.payment_status !== 'paid';
      }
      return false;
    });
    
    // Calculate MoM growth
    const currentMonthBusinesses = businesses.filter((b: any) => {
      if (!b.subscription_start_date) return false;
      const startDate = new Date(b.subscription_start_date);
      return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    });
    
    const lastMonthBusinesses = businesses.filter((b: any) => {
      if (!b.subscription_start_date) return false;
      const startDate = new Date(b.subscription_start_date);
      return startDate.getMonth() === lastMonth && startDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate percentage growth
    const currentMonthCount = currentMonthBusinesses.length;
    const lastMonthCount = lastMonthBusinesses.length || 1; // Avoid division by zero
    const momGrowthPercentage = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    
    // Subscription revenue
    const subscriptionPayments = payments.filter((p: any) => 
      p.payment_type === 'initial_subscription' || p.payment_type === 'monthly_subscription'
    );
    const subscriptionRevenue = subscriptionPayments.reduce((sum: number, p: any) => 
      sum + (p.amount || 0), 0
    );
    
    // Analytics Stats - New Revenue Stream Metrics
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
    
    // Sentiment Analysis (positive if rating >= 4, neutral if 3, negative if <= 2)
    const positiveReviews = reviews.filter((r: any) => (r.rating || 0) >= 4).length;
    const neutralReviews = reviews.filter((r: any) => (r.rating || 0) === 3).length;
    const negativeReviews = reviews.filter((r: any) => (r.rating || 0) <= 2).length;
    const sentimentScore = reviews.length > 0
      ? ((positiveReviews * 1 + neutralReviews * 0.5 + negativeReviews * 0) / reviews.length) * 100
      : 0;
    
    // Engagement Metrics (simulated - in production would track actual clicks)
    const totalViews = businesses.length * 450; // Average 450 views per business
    const totalClicks = Math.floor(totalViews * 0.12); // 12% CTR average
    const totalCallClicks = Math.floor(totalClicks * 0.35); // 35% click to call
    const totalDirectionClicks = Math.floor(totalClicks * 0.45); // 45% directions
    const totalMenuViews = Math.floor(totalClicks * 0.85); // 85% view menu
    
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    const engagementRate = totalViews > 0 ? ((totalCallClicks + totalDirectionClicks + totalMenuViews) / totalViews) * 100 : 0;
    
    // Content Performance
    const activeSpecials = specials.filter((s: any) => {
      const endDate = new Date(s.end_date);
      return endDate >= now;
    }).length;
    
    const activeEvents = events.filter((e: any) => {
      const eventDate = new Date(e.date);
      return eventDate >= now;
    }).length;
    
    const stats = {
      total_businesses: businesses.length,
      active_businesses: paidBusinesses.length,
      subscriptions_received: paidBusinesses.length,
      outstanding_subscriptions: pendingPaymentBusinesses.length + overdueBusinesses.length,
      overdue_subscriptions: overdueBusinesses.length,
      pending_payment: pendingPaymentBusinesses.length,
      subscription_revenue: subscriptionRevenue,
      current_month_signups: currentMonthCount,
      last_month_signups: lastMonthCount,
      mom_growth_percentage: momGrowthPercentage,
      mom_growth_positive: momGrowthPercentage >= 0,
      
      // Analytics & Engagement Metrics (New Revenue Stream)
      total_reviews: totalReviews,
      avg_rating: avgRating,
      positive_reviews: positiveReviews,
      neutral_reviews: neutralReviews,
      negative_reviews: negativeReviews,
      sentiment_score: sentimentScore,
      
      total_views: totalViews,
      total_clicks: totalClicks,
      ctr: ctr,
      engagement_rate: engagementRate,
      call_clicks: totalCallClicks,
      direction_clicks: totalDirectionClicks,
      menu_views: totalMenuViews,
      
      active_specials: activeSpecials,
      active_events: activeEvents,
      
      // Legacy fields
      total_customers: 0,
      total_revenue: subscriptionRevenue,
      monthly_revenue: subscriptionRevenue / 12,
      total_transactions: subscriptionPayments.length,
      pending_payouts: 0,
      paid_subscriptions: paidBusinesses.length
    };
    
    console.log('✅ Platform stats calculated:', stats);
    return c.json({ stats });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get all payments
app.get("/make-server-175b2872/admin/payments", async (c) => {
  try {
    console.log('💳 Admin: Fetching all payments');
    
    const businesses = await kv.getByPrefix('business:');
    
    // Generate simulated payment data
    const payments = [];
    const paymentTypes = ['subscription', 'commission', 'transaction_fee', 'premium_feature'];
    const statuses = ['completed', 'pending', 'failed'];
    
    for (let i = 0; i < 50; i++) {
      const business = businesses[Math.floor(Math.random() * businesses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      payments.push({
        id: `pay_${Date.now()}_${i}`,
        business_id: business?.id || 'unknown',
        business_name: business?.name || 'Unknown Business',
        amount: Math.random() * 500 + 50,
        type: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        payment_method: ['card', 'eft', 'instant_eft'][Math.floor(Math.random() * 3)],
        customer_name: i % 3 === 0 ? `Customer ${i}` : undefined,
        created_at: date.toISOString()
      });
    }
    
    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`✅ Generated ${payments.length} payment records`);
    return c.json({ payments });
  } catch (error) {
    console.error('❌ Error fetching admin payments:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// Toggle business status (activate/deactivate)
app.put("/make-server-175b2872/admin/businesses/:id/toggle-status", async (c) => {
  try {
    const businessId = c.req.param('id');
    const body = await c.req.json();
    const { is_active } = body;
    
    console.log(`🔄 Admin: Toggling business status for ${businessId} to ${is_active}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const updatedBusiness = {
      ...business,
      is_active: is_active, // Set the is_active field
      status: is_active ? 'approved' : 'suspended', // Also update status field
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${businessId}`, updatedBusiness);
    
    console.log(`✅ Business status updated: ${businessId} - is_active: ${is_active}`);
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error toggling business status:', error);
    return c.json({ error: 'Failed to toggle business status' }, 500);
  }
});

// Get admin analytics data
app.get("/make-server-175b2872/admin/analytics", async (c) => {
  try {
    console.log('📈 Admin: Fetching analytics data');
    
    const businesses = await kv.getByPrefix('business:');
    
    // Revenue by month (last 6 months)
    const monthlyRevenue = [
      { month: 'Aug', revenue: 45000 },
      { month: 'Sep', revenue: 52000 },
      { month: 'Oct', revenue: 48000 },
      { month: 'Nov', revenue: 61000 },
      { month: 'Dec', revenue: 58000 },
      { month: 'Jan', revenue: 67000 }
    ];
    
    // Business growth
    const businessGrowth = businesses.map((b: any, index: number) => ({
      date: new Date(Date.now() - (businesses.length - index) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      count: index + 1
    }));
    
    // Revenue by business type
    const revenueByType = {
      restaurant: businesses.filter((b: any) => b.type === 'restaurant').length * 15000,
      bar: businesses.filter((b: any) => b.type === 'bar').length * 12000,
      cafe: businesses.filter((b: any) => b.type === 'cafe').length * 8000,
      hotel: businesses.filter((b: any) => b.type === 'hotel').length * 25000
    };
    
    // Top cities
    const cityCounts: Record<string, number> = {};
    businesses.forEach((b: any) => {
      cityCounts[b.city] = (cityCounts[b.city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));
    
    console.log('✅ Analytics data compiled');
    return c.json({
      monthlyRevenue,
      businessGrowth,
      revenueByType,
      topCities
    });
  } catch (error) {
    console.error('❌ Error fetching admin analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT ENDPOINTS
// ============================================

// Get platform settings (subscription fee, etc.)
app.get("/make-server-175b2872/admin/settings", async (c) => {
  try {
    console.log('⚙️ Fetching platform settings');
    
    const settings = await kv.get('platform:settings');
    
    if (!settings) {
      // Return default settings
      const defaultSettings = {
        monthly_subscription_fee: 299,
        auto_approve_businesses: false,
        reminder_days_before_due: 7,
        overdue_grace_period: 5
      };
      
      await kv.set('platform:settings', defaultSettings);
      return c.json({ settings: defaultSettings });
    }
    
    return c.json({ settings });
  } catch (error) {
    console.error('❌ Error fetching platform settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update platform settings
app.put("/make-server-175b2872/admin/settings", async (c) => {
  try {
    const body = await c.req.json();
    console.log('⚙️ Updating platform settings:', body);
    
    await kv.set('platform:settings', body);
    
    console.log('✅ Platform settings updated');
    return c.json({ success: true, settings: body });
  } catch (error) {
    console.error('❌ Error updating platform settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Generate Yoco payment link for subscription
app.post("/make-server-175b2872/admin/subscriptions/generate-payment-link", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;
    
    console.log(`💳 Generating Yoco payment link for business: ${business_id}`);
    
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const settings = await kv.get('platform:settings') || { monthly_subscription_fee: 299 };
    const amount = settings.monthly_subscription_fee * 100; // Convert to cents
    
    // Create Yoco payment link
    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('YOCO_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'ZAR',
        cancelUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/cancelled`,
        successUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/success`,
        failureUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/failed`,
        metadata: {
          business_id: business_id,
          business_name: business.name,
          payment_type: 'monthly_subscription',
          month: new Date().toISOString().slice(0, 7) // YYYY-MM format
        }
      })
    });
    
    if (!yocoResponse.ok) {
      const error = await yocoResponse.text();
      console.error('❌ Yoco API error:', error);
      return c.json({ error: 'Failed to create payment link' }, 500);
    }
    
    const yocoData = await yocoResponse.json();
    const paymentLink = yocoData.redirectUrl;
    
    // Calculate next payment due date (30 days from now)
    const nextPaymentDue = new Date();
    nextPaymentDue.setDate(nextPaymentDue.getDate() + 30);
    
    // Update business subscription data
    const subscriptionData = {
      business_id: business_id,
      payment_link: paymentLink,
      payment_link_id: yocoData.id,
      amount: settings.monthly_subscription_fee,
      status: 'pending',
      created_at: new Date().toISOString(),
      next_payment_due: nextPaymentDue.toISOString(),
      month: new Date().toISOString().slice(0, 7)
    };
    
    await kv.set(`subscription:${business_id}:${Date.now()}`, subscriptionData);
    
    // Update business record
    const updatedBusiness = {
      ...business,
      payment_status: 'pending',
      payment_link: paymentLink,
      next_payment_due: nextPaymentDue.toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log('✅ Payment link generated and stored');
    return c.json({ 
      success: true, 
      payment_link: paymentLink,
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('❌ Error generating payment link:', error);
    return c.json({ error: 'Failed to generate payment link' }, 500);
  }
});

// Yoco webhook handler for payment confirmations
app.post("/make-server-175b2872/webhooks/yoco", async (c) => {
  try {
    const body = await c.req.json();
    console.log('🔔 Yoco webhook received:', body);
    
    const { type, payload } = body;
    
    if (type === 'checkout.succeeded') {
      const { id, metadata, amount, currency } = payload;
      const { business_id, payment_type } = metadata;
      
      console.log(`✅ Payment succeeded for business: ${business_id}`);
      
      if (payment_type === 'monthly_subscription') {
        // Get business
        const business = await kv.get(`business:${business_id}`);
        if (!business) {
          console.error('❌ Business not found:', business_id);
          return c.json({ error: 'Business not found' }, 404);
        }
        
        // Calculate next payment due date
        const nextPaymentDue = new Date();
        nextPaymentDue.setDate(nextPaymentDue.getDate() + 30);
        
        // Update subscription record
        const subscriptions = await kv.getByPrefix(`subscription:${business_id}:`);
        const latestSubscription = subscriptions.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        if (latestSubscription) {
          const subscriptionKey = `subscription:${business_id}:${new Date(latestSubscription.created_at).getTime()}`;
          await kv.set(subscriptionKey, {
            ...latestSubscription,
            status: 'paid',
            paid_at: new Date().toISOString(),
            yoco_payment_id: id
          });
        }
        
        // Update business record
        const updatedBusiness = {
          ...business,
          payment_status: 'paid',
          last_payment_date: new Date().toISOString(),
          next_payment_due: nextPaymentDue.toISOString(),
          subscription_status: 'active',
          is_active: true
        };
        
        if (!business.subscription_start_date) {
          updatedBusiness.subscription_start_date = new Date().toISOString();
        }
        
        await kv.set(`business:${business_id}`, updatedBusiness);
        
        // Record payment in payment history
        const paymentRecord = {
          id: `pay_${Date.now()}`,
          business_id: business_id,
          business_name: business.name,
          amount: amount / 100, // Convert from cents
          type: 'subscription',
          status: 'completed',
          created_at: new Date().toISOString(),
          yoco_payment_id: id,
          currency: currency
        };
        await kv.set(`payment:${paymentRecord.id}`, paymentRecord);
        
        console.log('✅ Subscription payment processed successfully');
      }
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing Yoco webhook:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
});

// Mark subscription as paid manually (admin override)
app.post("/make-server-175b2872/admin/subscriptions/:business_id/mark-paid", async (c) => {
  try {
    const businessId = c.req.param('business_id');
    console.log(`✅ Admin marking subscription as paid for business: ${businessId}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Calculate next payment due date
    const nextPaymentDue = new Date();
    nextPaymentDue.setDate(nextPaymentDue.getDate() + 30);
    
    // Update business record
    const updatedBusiness = {
      ...business,
      payment_status: 'paid',
      last_payment_date: new Date().toISOString(),
      next_payment_due: nextPaymentDue.toISOString(),
      subscription_status: 'active',
      is_active: true
    };
    
    if (!business.subscription_start_date) {
      updatedBusiness.subscription_start_date = new Date().toISOString();
    }
    
    await kv.set(`business:${businessId}`, updatedBusiness);
    
    // Create manual payment record
    const settings = await kv.get('platform:settings') || { monthly_subscription_fee: 299 };
    const paymentRecord = {
      id: `pay_${Date.now()}`,
      business_id: businessId,
      business_name: business.name,
      amount: settings.monthly_subscription_fee,
      type: 'subscription',
      status: 'completed',
      created_at: new Date().toISOString(),
      payment_method: 'manual_admin_override'
    };
    await kv.set(`payment:${paymentRecord.id}`, paymentRecord);
    
    console.log('✅ Subscription marked as paid');
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error marking subscription as paid:', error);
    return c.json({ error: 'Failed to mark subscription as paid' }, 500);
  }
});

// Send payment reminder to business
app.post("/make-server-175b2872/admin/subscriptions/:business_id/send-reminder", async (c) => {
  try {
    const businessId = c.req.param('business_id');
    console.log(`📧 Sending payment reminder to business: ${businessId}`);
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const settings = await kv.get('platform:settings') || { monthly_subscription_fee: 299 };
    
    // Generate new payment link
    const amount = settings.monthly_subscription_fee * 100; // Convert to cents
    
    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('YOCO_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'ZAR',
        cancelUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/cancelled`,
        successUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/success`,
        failureUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/failed`,
        metadata: {
          business_id: businessId,
          business_name: business.name,
          payment_type: 'monthly_subscription',
          month: new Date().toISOString().slice(0, 7)
        }
      })
    });
    
    if (!yocoResponse.ok) {
      const error = await yocoResponse.text();
      console.error('❌ Yoco API error:', error);
      return c.json({ error: 'Failed to create payment link' }, 500);
    }
    
    const yocoData = await yocoResponse.json();
    const paymentLink = yocoData.redirectUrl;
    
    // Update business with reminder status
    const updatedBusiness = {
      ...business,
      payment_status: 'reminder_sent',
      payment_link: paymentLink,
      reminder_sent_at: new Date().toISOString()
    };
    await kv.set(`business:${businessId}`, updatedBusiness);
    
    // Log reminder
    const reminderRecord = {
      business_id: businessId,
      business_name: business.name,
      business_email: business.email,
      payment_link: paymentLink,
      sent_at: new Date().toISOString(),
      amount: settings.monthly_subscription_fee
    };
    await kv.set(`reminder:${businessId}:${Date.now()}`, reminderRecord);
    
    console.log(`✅ Payment reminder sent with link: ${paymentLink}`);
    
    // In a production environment, you would send an actual email here
    // For now, we're just generating the link and updating the status
    
    return c.json({ 
      success: true, 
      payment_link: paymentLink,
      message: `Reminder sent to ${business.email}`
    });
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return c.json({ error: 'Failed to send payment reminder' }, 500);
  }
});

// Get subscription overview for all businesses
app.get("/make-server-175b2872/admin/subscriptions/overview", async (c) => {
  try {
    console.log('📊 Fetching subscription overview');
    
    const businesses = await kv.getByPrefix('business:');
    const settings = await kv.get('platform:settings') || { monthly_subscription_fee: 299 };
    
    const now = new Date();
    
    // Categorize businesses by payment status
    const paidBusinesses = businesses.filter((b: any) => b.payment_status === 'paid');
    const pendingBusinesses = businesses.filter((b: any) => b.payment_status === 'pending');
    const reminderSentBusinesses = businesses.filter((b: any) => b.payment_status === 'reminder_sent');
    
    // Find overdue businesses
    const overdueBusinesses = businesses.filter((b: any) => {
      if (!b.next_payment_due) return false;
      const dueDate = new Date(b.next_payment_due);
      return dueDate < now && b.payment_status !== 'paid';
    });
    
    // Calculate revenue
    const subscriptionRevenue = paidBusinesses.length * settings.monthly_subscription_fee;
    const expectedRevenue = businesses.length * settings.monthly_subscription_fee;
    const outstandingRevenue = expectedRevenue - subscriptionRevenue;
    
    // Businesses needing attention (due in next 7 days)
    const needingAttention = businesses.filter((b: any) => {
      if (!b.next_payment_due || b.payment_status === 'paid') return false;
      const dueDate = new Date(b.next_payment_due);
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    });
    
    console.log('✅ Subscription overview compiled');
    return c.json({
      overview: {
        total_businesses: businesses.length,
        paid_count: paidBusinesses.length,
        pending_count: pendingBusinesses.length,
        overdue_count: overdueBusinesses.length,
        reminder_sent_count: reminderSentBusinesses.length,
        subscription_revenue: subscriptionRevenue,
        expected_revenue: expectedRevenue,
        outstanding_revenue: outstandingRevenue,
        monthly_fee: settings.monthly_subscription_fee
      },
      businesses: businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        payment_status: b.payment_status || 'pending',
        last_payment_date: b.last_payment_date,
        next_payment_due: b.next_payment_due,
        payment_link: b.payment_link,
        subscription_start_date: b.subscription_start_date,
        is_active: b.is_active
      })),
      needing_attention: needingAttention.map((b: any) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        next_payment_due: b.next_payment_due,
        days_until_due: Math.ceil((new Date(b.next_payment_due).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching subscription overview:', error);
    return c.json({ error: 'Failed to fetch subscription overview' }, 500);
  }
});

// Check and send automated reminders (can be called by cron job)
app.post("/make-server-175b2872/admin/subscriptions/auto-remind", async (c) => {
  try {
    console.log('🤖 Running automated subscription reminder check');
    
    const businesses = await kv.getByPrefix('business:');
    const settings = await kv.get('platform:settings') || { 
      monthly_subscription_fee: 299,
      reminder_days_before_due: 7 
    };
    
    const now = new Date();
    const remindersSent = [];
    
    for (const business of businesses) {
      // Skip if already paid or reminder already sent recently
      if (business.payment_status === 'paid') continue;
      
      // Check if payment is due soon
      if (business.next_payment_due) {
        const dueDate = new Date(business.next_payment_due);
        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        // Send reminder if within the reminder window
        if (daysUntilDue <= settings.reminder_days_before_due && daysUntilDue >= 0) {
          // Check if reminder was sent in the last 3 days to avoid spam
          const lastReminderSent = business.reminder_sent_at ? new Date(business.reminder_sent_at) : null;
          const daysSinceLastReminder = lastReminderSent 
            ? (now.getTime() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24)
            : 999;
          
          if (daysSinceLastReminder > 3) {
            // Generate payment link and send reminder
            const amount = settings.monthly_subscription_fee * 100;
            
            const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('YOCO_SECRET_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                amount: amount,
                currency: 'ZAR',
                cancelUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/cancelled`,
                successUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/success`,
                failureUrl: `${Deno.env.get('FRONTEND_URL') || 'https://vibespot.co.za'}/business/subscription/failed`,
                metadata: {
                  business_id: business.id,
                  business_name: business.name,
                  payment_type: 'monthly_subscription',
                  month: new Date().toISOString().slice(0, 7)
                }
              })
            });
            
            if (yocoResponse.ok) {
              const yocoData = await yocoResponse.json();
              const paymentLink = yocoData.redirectUrl;
              
              // Update business
              await kv.set(`business:${business.id}`, {
                ...business,
                payment_status: 'reminder_sent',
                payment_link: paymentLink,
                reminder_sent_at: now.toISOString()
              });
              
              remindersSent.push({
                business_id: business.id,
                business_name: business.name,
                payment_link: paymentLink
              });
            }
          }
        }
      }
    }
    
    console.log(`✅ Automated reminders sent: ${remindersSent.length}`);
    return c.json({ 
      success: true, 
      reminders_sent: remindersSent.length,
      details: remindersSent
    });
  } catch (error) {
    console.error('❌ Error running automated reminders:', error);
    return c.json({ error: 'Failed to run automated reminders' }, 500);
  }
});

// ============================================
// EVENT INTEREST TRACKING
// ============================================

// Mark user as interested in an event
app.post("/make-server-175b2872/kv/events/:eventId/interest", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();
    const { user_id, status, user_email, user_mobile, notification_preference } = body; // status: 'interested' or 'going'
    
    if (!user_id || !status) {
      return c.json({ error: 'user_id and status are required' }, 400);
    }
    
    // Verify event exists
    const event = await kv.get(`event:${eventId}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    // Get business details
    const business = await kv.get(`business:${event.business_id}`);
    
    // Store interest with user contact info for reminders
    const interestKey = `event-interest:${eventId}:${user_id}`;
    const interestData = {
      event_id: eventId,
      user_id,
      user_email: user_email || user_id, // Use email as fallback
      user_mobile: user_mobile || '',
      notification_preference: notification_preference || 'email', // 'email' or 'whatsapp'
      status, // 'interested' or 'going'
      event_date: event.event_date,
      event_time: event.event_time,
      event_title: event.title,
      business_id: event.business_id,
      business_name: business?.name || 'Unknown',
      created_at: new Date().toISOString()
    };
    
    await kv.set(interestKey, interestData);
    
    // Create a notification for the user
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      id: notificationId,
      user_id,
      type: status === 'going' ? 'event-going' : 'event-interested',
      title: status === 'going' 
        ? `✅ You're Going!`
        : `⭐ Event Marked`,
      message: status === 'going'
        ? `Great! You're going to "${event.title}" at ${business?.name || 'the venue'}.\n\n📱 You'll receive a reminder notification closer to the event.`
        : `Marked as interested in "${event.title}".`,
      business_id: event.business_id,
      business_name: business?.name || 'Unknown',
      event_id: eventId,
      event_title: event.title,
      event_date: event.event_date,
      created_at: new Date().toISOString(),
      read: false,
      play_sound: false
    };
    
    await kv.set(`notification:${user_id}:${notificationId}`, notification);
    
    console.log(`✅ User ${user_id} marked as ${status} for event ${eventId} - notification created`);
    
    return c.json({ success: true, interest: interestData });
  } catch (error) {
    console.error('Error marking event interest:', error);
    return c.json({ error: 'Failed to mark interest' }, 500);
  }
});

// Remove interest from event
app.delete("/make-server-175b2872/kv/events/:eventId/interest/:userId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.req.param('userId');
    
    await kv.del(`event-interest:${eventId}:${userId}`);
    
    console.log(`✅ Removed interest for user ${userId} from event ${eventId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing event interest:', error);
    return c.json({ error: 'Failed to remove interest' }, 500);
  }
});

// Get user's interested events
app.get("/make-server-175b2872/kv/user/:userId/interested-events", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const allInterests = await kv.getByPrefix('event-interest:');
    const userInterests = allInterests.filter((interest: any) => interest.user_id === userId);
    
    return c.json({ interests: userInterests });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return c.json({ error: 'Failed to fetch interests' }, 500);
  }
});

// Check if user is interested in an event
app.get("/make-server-175b2872/kv/events/:eventId/interest/:userId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.req.param('userId');
    
    const interest = await kv.get(`event-interest:${eventId}:${userId}`);
    
    return c.json({ 
      interested: !!interest,
      status: interest?.status || null
    });
  } catch (error) {
    console.error('Error checking event interest:', error);
    return c.json({ error: 'Failed to check interest' }, 500);
  }
});

// Send event reminders for today's events
app.post("/make-server-175b2872/kv/send-event-reminders", async (c) => {
  try {
    console.log('🔔 Checking for events happening today...');
    
    // Get today's date (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    
    // Get all event interests
    const allInterests = await kv.getByPrefix('event-interest:');
    
    // Filter for events happening today
    const todaysEventInterests = allInterests.filter((interest: any) => {
      const eventDate = interest.event_date?.split('T')[0];
      return eventDate === today;
    });
    
    if (todaysEventInterests.length === 0) {
      console.log('📅 No events happening today');
      return c.json({ success: true, reminders_sent: 0 });
    }
    
    console.log(`📅 Found ${todaysEventInterests.length} event interests for today`);
    
    let remindersSent = 0;
    
    // Create reminder notifications for each user
    for (const interest of todaysEventInterests) {
      try {
        // Check if we already sent a reminder for this event today
        const reminderKey = `reminder-sent:${interest.event_id}:${interest.user_id}:${today}`;
        const alreadySent = await kv.get(reminderKey);
        
        if (alreadySent) {
          console.log(`⏭️ Already sent reminder to ${interest.user_id} for event ${interest.event_id}`);
          continue;
        }
        
        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const notification = {
          id: notificationId,
          user_id: interest.user_id,
          business_id: interest.business_id,
          business_name: interest.business_name,
          business_logo: null,
          type: 'event_reminder',
          title: '⏰ Event Reminder!',
          message: `Today: ${interest.event_title} at ${interest.event_time || 'TBD'}`,
          event_id: interest.event_id,
          image_url: null,
          created_at: new Date().toISOString(),
          read: false,
          play_sound: true // Special flag for sound notification
        };
        
        await kv.set(`notification:${interest.user_id}:${notificationId}`, notification);
        
        // Send email or WhatsApp reminder based on user preference
        try {
          const { sendEmail, sendWhatsApp } = await import('./notifications.tsx');
          
          const reminderMessage = `⏰ Event Reminder!\n\n${interest.event_title}\n📍 ${interest.business_name}\n📅 Today at ${interest.event_time || 'TBD'}\n\nDon't miss it!`;
          
          if (interest.notification_preference === 'whatsapp' && interest.user_mobile) {
            // Send WhatsApp reminder
            await sendWhatsApp({
              to: interest.user_mobile,
              message: reminderMessage
            });
            console.log(`📱 WhatsApp reminder sent to ${interest.user_mobile}`);
          } else if (interest.user_email) {
            // Send Email reminder
            await sendEmail({
              to: interest.user_email,
              subject: `⏰ Event Today: ${interest.event_title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #06B6D4;">⏰ Event Reminder!</h2>
                  <p>Don't forget about this event happening <strong>today</strong>:</p>
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0891b2;">${interest.event_title}</h3>
                    <p style="margin: 10px 0;"><strong>📍 Venue:</strong> ${interest.business_name}</p>
                    <p style="margin: 10px 0;"><strong>🕐 Time:</strong> ${interest.event_time || 'TBD'}</p>
                    <p style="margin: 10px 0;"><strong>📅 Date:</strong> Today</p>
                  </div>
                  <p>See you there! 🎉</p>
                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This reminder was sent because you marked yourself as ${interest.status === 'going' ? 'going' : 'interested'} in this event on MYVIBE.
                  </p>
                </div>
              `
            });
            console.log(`📧 Email reminder sent to ${interest.user_email}`);
          }
        } catch (notifError) {
          console.error('⚠️ Failed to send email/WhatsApp reminder (non-blocking):', notifError);
          // Don't fail the whole process if external notification fails
        }
        
        // Mark reminder as sent
        await kv.set(reminderKey, { sent_at: new Date().toISOString() });
        
        remindersSent++;
        console.log(`✅ Sent reminder to ${interest.user_id} for event: ${interest.event_title}`);
      } catch (error) {
        console.error(`⚠️ Failed to send reminder for event ${interest.event_id}:`, error);
      }
    }
    
    console.log(`✅ Sent ${remindersSent} event reminders`);
    
    return c.json({ 
      success: true, 
      reminders_sent: remindersSent,
      events_checked: todaysEventInterests.length
    });
  } catch (error) {
    console.error('Error sending event reminders:', error);
    return c.json({ error: 'Failed to send reminders' }, 500);
  }
});

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get notifications for a user
app.get("/make-server-175b2872/kv/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log(`📬 Fetching notifications for user: ${userId}`);
    
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    // Sort by date (newest first)
    const sortedNotifications = notifications.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ Found ${sortedNotifications.length} notifications`);
    
    return c.json({ 
      notifications: sortedNotifications,
      unread_count: sortedNotifications.filter((n: any) => !n.read).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.put("/make-server-175b2872/kv/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notificationId = c.req.param('notificationId');
    
    const key = `notification:${userId}:${notificationId}`;
    const notification = await kv.get(key);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }
    
    const updatedNotification = {
      ...notification,
      read: true,
      read_at: new Date().toISOString()
    };
    
    await kv.set(key, updatedNotification);
    
    console.log(`✅ Marked notification as read: ${notificationId}`);
    
    return c.json({ success: true, notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Mark all notifications as read for a user
app.put("/make-server-175b2872/kv/notifications/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    for (const notification of notifications) {
      if (!notification.read) {
        const updatedNotification = {
          ...notification,
          read: true,
          read_at: new Date().toISOString()
        };
        
        await kv.set(`notification:${userId}:${notification.id}`, updatedNotification);
      }
    }
    
    console.log(`✅ Marked all notifications as read for user: ${userId}`);
    
    return c.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// Delete a notification
app.delete("/make-server-175b2872/kv/notifications/:userId/:notificationId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notificationId = c.req.param('notificationId');
    
    await kv.del(`notification:${userId}:${notificationId}`);
    
    console.log(`✅ Deleted notification: ${notificationId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// Get unread count for a user
app.get("/make-server-175b2872/kv/notifications/:userId/unread-count", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    const unreadCount = notifications.filter((n: any) => !n.read).length;
    
    return c.json({ unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return c.json({ error: 'Failed to fetch unread count' }, 500);
  }
});

// ============================================
// ANALYTICS TRACKING ENDPOINTS
// ============================================

// Track ad/carousel click
app.post("/make-server-175b2872/analytics/track-click", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, click_type, user_email, source_page } = body;
    
    console.log(`📊 Tracking click: ${business_id} - ${click_type}`);
    
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const clickRecord = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      business_id,
      business_name: business.name,
      click_type: click_type || 'carousel',
      timestamp: new Date().toISOString(),
      user_email: user_email || 'anonymous',
      source_page: source_page || 'home',
      created_at: new Date().toISOString()
    };
    
    await kv.set(`click:${clickRecord.id}`, clickRecord);
    
    const updatedBusiness = {
      ...business,
      total_clicks: (business.total_clicks || 0) + 1,
      last_click_at: new Date().toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log(`✅ Click tracked for ${business.name}`);
    return c.json({ success: true, click: clickRecord });
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Track business profile view
app.post("/make-server-175b2872/analytics/track-view", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;
    
    console.log(`👁️ Tracking view: ${business_id}`);
    
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      console.error(`❌ Business not found: ${business_id}`);
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Update business view count
    const updatedBusiness = {
      ...business,
      total_views: (business.total_views || 0) + 1,
      last_viewed_at: new Date().toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log(`✅ View tracked for ${business.name} - Total views: ${updatedBusiness.total_views}`);
    return c.json({ success: true, views: updatedBusiness.total_views });
  } catch (error) {
    console.error('❌ Error tracking view:', error);
    return c.json({ error: 'Failed to track view', details: error.message }, 500);
  }
});

// ADMIN: Reset analytics data for all businesses
app.post("/make-server-175b2872/admin/reset-analytics", async (c) => {
  try {
    console.log('🔄 Resetting all analytics data...');
    
    const allBusinesses = await kv.getByPrefix('business:');
    let resetCount = 0;
    
    for (const business of allBusinesses) {
      const updatedBusiness = {
        ...business,
        total_views: 0,
        total_clicks: 0,
        total_reservations: 0,
        estimated_revenue_generated: 0,
        last_viewed_at: undefined,
        last_click_at: undefined,
        last_reservation_at: undefined
      };
      await kv.set(`business:${business.id}`, updatedBusiness);
      console.log(`  ✓ Reset analytics for: ${business.name}`);
      resetCount++;
    }
    
    console.log(`✅ Analytics reset complete for ${resetCount} businesses`);
    return c.json({ success: true, businesses_reset: resetCount });
  } catch (error) {
    console.error('❌ Error resetting analytics:', error);
    return c.json({ error: 'Failed to reset analytics' }, 500);
  }
});

// Track reservation
app.post("/make-server-175b2872/analytics/track-reservation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      business_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      party_size, 
      reservation_date, 
      reservation_time, 
      special_requests,
      preferred_channel // 'email' or 'whatsapp'
    } = body;
    
    console.log(`📅 Tracking reservation: ${business_id} - ${customer_name}`);
    
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Calculate estimated spend per person based on price range
    const getEstimatedSpendPerPerson = (priceRange: string) => {
      switch(priceRange) {
        case '$': return 150;      // Budget: R100-R200
        case '$$': return 300;     // Moderate: R200-R400
        case '$$$': return 500;    // Upscale: R400-R600
        case '$$$$': return 800;   // Fine Dining: R600-R1000+
        default: return 300;       // Default to moderate
      }
    };
    
    const spendPerPerson = getEstimatedSpendPerPerson(business.price_range || '$$');
    const partySize = parseInt(party_size) || 2;
    
    const reservationRecord = {
      id: `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      business_id,
      business_name: business.name,
      business_logo: business.logo_url,
      business_address: business.address,
      business_city: business.city,
      user_name: customer_name,
      user_email: customer_email,
      user_mobile: customer_phone,
      party_size: partySize,
      reservation_date,
      reservation_time,
      special_requests: special_requests || '',
      status: 'pending',
      estimated_value: partySize * spendPerPerson,
      price_per_person: spendPerPerson,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`reservation:${reservationRecord.id}`, reservationRecord);
    
    const updatedBusiness = {
      ...business,
      total_reservations: (business.total_reservations || 0) + 1,
      estimated_revenue_generated: (business.estimated_revenue_generated || 0) + reservationRecord.estimated_value,
      last_reservation_at: new Date().toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log(`✅ Reservation tracked - Value: R${reservationRecord.estimated_value}`);
    
    // Send email notification asynchronously (non-blocking)
    // This runs in the background after the response is sent
    (async () => {
      try {
        const { sendReservationConfirmation } = await import('./notifications.tsx');
        
        // Send confirmation email to customer
        if (customer_email && preferred_channel === 'email') {
          const emailSent = await sendReservationConfirmation({
            customerName: customer_name,
            customerEmail: customer_email,
            customerPhone: customer_phone,
            businessName: business.name,
            businessAddress: `${business.address}, ${business.city}`,
            businessPhone: business.phone,
            reservationDate: new Date(reservation_date).toLocaleDateString('en-ZA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            reservationTime: reservation_time,
            partySize: partySize,
            specialRequests: special_requests,
            preferredChannel: 'email'
          });
          
          if (emailSent) {
            console.log(`✅ Confirmation email sent to ${customer_email}`);
          } else {
            console.log(`⚠️ Email sending skipped or failed (check SMTP2GO setup)`);
          }
        }
      } catch (error) {
        console.error('❌ Background email error:', error);
        // Don't fail the reservation if email fails
      }
    })();
    
    // Return immediately for instant user feedback
    return c.json({ success: true, reservation: reservationRecord });
  } catch (error) {
    console.error('❌ Error tracking reservation:', error);
    return c.json({ error: 'Failed to track reservation' }, 500);
  }
});

// Get business analytics
app.get("/make-server-175b2872/analytics/business/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    
    const allClicks = await kv.getByPrefix('click:');
    const businessClicks = allClicks.filter((click: any) => click.business_id === businessId);
    
    const allReservations = await kv.getByPrefix('reservation:');
    const businessReservations = allReservations.filter((res: any) => res.business_id === businessId);
    
    const business = await kv.get(`business:${businessId}`);
    
    const total_clicks = businessClicks.length;
    const total_reservations = businessReservations.length;
    const total_views = business?.total_views || 0;
    const ctr = total_views > 0 ? (total_clicks / total_views * 100).toFixed(2) : 0;
    const conversion_rate = total_clicks > 0 ? (total_reservations / total_clicks * 100).toFixed(2) : 0;
    const estimated_revenue = businessReservations.reduce((sum: number, res: any) => sum + (res.estimated_value || 0), 0);
    
    return c.json({
      business_id: businessId,
      business_name: business?.name || 'Unknown',
      metrics: {
        total_views,
        total_clicks,
        total_reservations,
        ctr: parseFloat(ctr),
        conversion_rate: parseFloat(conversion_rate),
        estimated_revenue
      },
      recent_clicks: businessClicks.slice(-10).reverse(),
      recent_reservations: businessReservations.slice(-10).reverse()
    });
  } catch (error) {
    console.error('❌ Error fetching business analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get platform-wide analytics for admin
app.get("/make-server-175b2872/analytics/platform", async (c) => {
  try {
    const allClicks = await kv.getByPrefix('click:');
    const allReservations = await kv.getByPrefix('reservation:');
    const allBusinesses = await kv.getByPrefix('business:');
    
    const total_clicks = allClicks.length;
    const total_reservations = allReservations.length;
    const total_views = allBusinesses.reduce((sum: number, b: any) => sum + (b.total_views || 0), 0);
    const platform_ctr = total_views > 0 ? (total_clicks / total_views * 100).toFixed(2) : 0;
    const reservation_conversion = total_clicks > 0 ? (total_reservations / total_clicks * 100).toFixed(2) : 0;
    const total_estimated_revenue = allReservations.reduce((sum: number, res: any) => sum + (res.estimated_value || 0), 0);
    
    const businessPerformance = allBusinesses.map((business: any) => {
      const businessClicks = allClicks.filter((c: any) => c.business_id === business.id);
      const businessReservations = allReservations.filter((r: any) => r.business_id === business.id);
      return {
        id: business.id,
        name: business.name,
        clicks: businessClicks.length,
        reservations: businessReservations.length,
        revenue: businessReservations.reduce((sum: number, r: any) => sum + (r.estimated_value || 0), 0)
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);
    
    return c.json({
      platform_metrics: {
        total_views,
        total_clicks,
        total_reservations,
        platform_ctr: parseFloat(platform_ctr),
        reservation_conversion: parseFloat(reservation_conversion),
        total_estimated_revenue
      },
      top_businesses: businessPerformance.slice(0, 10),
      recent_clicks: allClicks.slice(-20).reverse(),
      recent_reservations: allReservations.slice(-20).reverse()
    });
  } catch (error) {
    console.error('❌ Error fetching platform analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get all reservations for admin
app.get("/make-server-175b2872/analytics/reservations", async (c) => {
  try {
    const allReservations = await kv.getByPrefix('reservation:');
    
    const sortedReservations = allReservations.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({
      reservations: sortedReservations,
      total_count: sortedReservations.length,
      total_value: sortedReservations.reduce((sum: number, r: any) => sum + (r.estimated_value || 0), 0)
    });
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Get user reservations by email
app.get("/make-server-175b2872/reservations/user/:email", async (c) => {
  try {
    const userEmail = decodeURIComponent(c.req.param('email'));
    console.log(`📋 Fetching reservations for user: ${userEmail}`);
    
    const allReservations = await kv.getByPrefix('reservation:');
    
    // Filter reservations for this user
    const userReservations = allReservations.filter((r: any) => 
      r.user_email === userEmail
    );
    
    // Sort by date (most recent first)
    const sortedReservations = userReservations.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ Found ${sortedReservations.length} reservations for ${userEmail}`);
    
    return c.json({
      reservations: sortedReservations,
      total_count: sortedReservations.length
    });
  } catch (error) {
    console.error('❌ Error fetching user reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Cancel a reservation (user-initiated)
app.post("/make-server-175b2872/reservations/:reservationId/cancel", async (c) => {
  try {
    const reservationId = c.req.param('reservationId');
    const body = await c.req.json();
    const { user_email } = body;
    
    console.log(`🚫 User ${user_email} cancelling reservation: ${reservationId}`);
    
    const reservation = await kv.get(`reservation:${reservationId}`);
    
    if (!reservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }
    
    // Verify the user owns this reservation
    if (reservation.user_email !== user_email) {
      return c.json({ error: 'Unauthorized to cancel this reservation' }, 403);
    }
    
    // Delete the reservation
    await kv.del(`reservation:${reservationId}`);
    
    console.log(`✅ Reservation cancelled: ${reservationId}`);
    
    // TODO: Send cancellation notification to business
    
    return c.json({ 
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    return c.json({ error: 'Failed to cancel reservation' }, 500);
  }
});

// Confirm a reservation
app.patch("/make-server-175b2872/kv/reservation/:reservationId/confirm", async (c) => {
  try {
    const reservationId = c.req.param('reservationId');
    const body = await c.req.json();
    const { business_name } = body;

    const reservation = await kv.get(`reservation:${reservationId}`);
    
    if (!reservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }

    // Update reservation status
    reservation.status = 'confirmed';
    reservation.confirmed_at = new Date().toISOString();
    
    await kv.set(`reservation:${reservationId}`, reservation);

    // Send confirmation email to customer
    try {
      await sendReservationConfirmation(
        reservation.user_email,
        reservation.user_name,
        business_name,
        reservation.reservation_date,
        reservation.reservation_time,
        reservation.party_size
      );
      console.log(`✅ Confirmation email sent to ${reservation.user_email}`);
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
    }

    // Send WhatsApp notification to customer
    try {
      const message = `✅ Reservation Confirmed!\n\nHi ${reservation.customer_name},\n\nYour reservation at ${business_name} has been confirmed!\n\n📅 Date: ${reservation.reservation_date}\n🕐 Time: ${reservation.reservation_time}\n👥 Party Size: ${reservation.party_size}\n\nWe look forward to seeing you!\n\n- ${business_name}`;
      
      await sendWhatsApp({
        to: reservation.customer_mobile,
        message: message
      });
      console.log(`✅ WhatsApp notification sent to ${reservation.customer_mobile}`);
    } catch (whatsappError) {
      console.error('❌ Error sending WhatsApp notification:', whatsappError);
    }

    // Create in-app notification for customer
    try {
      const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notification = {
        id: notificationId,
        user_id: reservation.user_email,
        business_id: reservation.business_id,
        business_name: business_name,
        type: 'reservation-confirmed',
        title: '✅ Reservation Confirmed',
        message: `Your reservation at ${business_name} for ${reservation.reservation_date} at ${reservation.reservation_time} has been confirmed!`,
        reservation_id: reservationId,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        party_size: reservation.party_size,
        read: false,
        created_at: new Date().toISOString()
      };
      
      await kv.set(`notification:${reservation.user_email}:${notificationId}`, notification);
      console.log(`✅ In-app notification created for ${reservation.user_email}`);
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
    }

    console.log(`✅ Reservation ${reservationId} confirmed`);

    return c.json({ 
      success: true,
      reservation,
      message: 'Reservation confirmed and customer notified'
    });
  } catch (error) {
    console.error('❌ Error confirming reservation:', error);
    return c.json({ error: 'Failed to confirm reservation' }, 500);
  }
});

// Reject a reservation
app.patch("/make-server-175b2872/kv/reservation/:reservationId/reject", async (c) => {
  try {
    const reservationId = c.req.param('reservationId');
    const body = await c.req.json();
    const { business_name, reason } = body;

    const reservation = await kv.get(`reservation:${reservationId}`);
    
    if (!reservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }

    // Update reservation status
    reservation.status = 'rejected';
    reservation.rejected_at = new Date().toISOString();
    reservation.rejection_reason = reason;
    
    await kv.set(`reservation:${reservationId}`, reservation);

    // Send rejection email to customer
    try {
      const response = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': Deno.env.get('SMTP2GO_API_KEY') || ''
        },
        body: JSON.stringify({
          sender: 'MYVIBE Reservations <reservations@vibespot.co.za>',
          to: [reservation.user_email],
          subject: `Reservation Update - ${business_name}`,
          text_body: `Hi ${reservation.customer_name},\n\nUnfortunately, we are unable to confirm your reservation at ${business_name} for ${reservation.reservation_date} at ${reservation.reservation_time}.\n\nReason: ${reason}\n\nWe apologize for any inconvenience. Please feel free to make another reservation for a different time.\n\nBest regards,\n${business_name}`,
          html_body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Reservation Update</h2>
              <p>Hi ${reservation.customer_name},</p>
              <p>Unfortunately, we are unable to confirm your reservation at <strong>${business_name}</strong>.</p>
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date:</strong> ${reservation.reservation_date}</p>
                <p><strong>🕐 Time:</strong> ${reservation.reservation_time}</p>
                <p><strong>👥 Party Size:</strong> ${reservation.party_size}</p>
              </div>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Reason:</strong> ${reason}</p>
              </div>
              <p>We apologize for any inconvenience. Please feel free to make another reservation for a different time.</p>
              <p>Best regards,<br/>${business_name}</p>
            </div>
          `
        })
      });

      if (response.ok) {
        console.log(`✅ Rejection email sent to ${reservation.customer_email}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending rejection email:', emailError);
    }

    // Send WhatsApp notification
    try {
      const message = `❌ Reservation Update\n\nHi ${reservation.customer_name},\n\nUnfortunately, we are unable to confirm your reservation at ${business_name} for ${reservation.reservation_date} at ${reservation.reservation_time}.\n\nReason: ${reason}\n\nWe apologize for any inconvenience.\n\n- ${business_name}`;
      
      await sendWhatsApp({
        to: reservation.customer_mobile,
        message: message
      });
      console.log(`✅ WhatsApp notification sent to ${reservation.customer_mobile}`);
    } catch (whatsappError) {
      console.error('❌ Error sending WhatsApp notification:', whatsappError);
    }

    // Create in-app notification for customer
    try {
      const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notification = {
        id: notificationId,
        user_id: reservation.user_email,
        business_id: reservation.business_id,
        business_name: business_name,
        type: 'reservation-rejected',
        title: '❌ Reservation Rejected',
        message: `Your reservation at ${business_name} for ${reservation.reservation_date} at ${reservation.reservation_time} has been rejected.`,
        reservation_id: reservationId,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        party_size: reservation.party_size,
        rejection_reason: reason,
        read: false,
        created_at: new Date().toISOString()
      };
      
      await kv.set(`notification:${reservation.user_email}:${notificationId}`, notification);
      console.log(`✅ In-app notification created for ${reservation.user_email}`);
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
    }

    console.log(`❌ Reservation ${reservationId} rejected - Reason: ${reason}`);

    return c.json({ 
      success: true,
      reservation,
      message: 'Reservation rejected and customer notified'
    });
  } catch (error) {
    console.error('❌ Error rejecting reservation:', error);
    return c.json({ error: 'Failed to reject reservation' }, 500);
  }
});

// ==================== SOCIAL MEDIA ADS ENDPOINTS ====================

// Submit a social media ad (TikTok, Instagram, Facebook, Google)
app.post("/make-server-175b2872/ads/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, business_name, platform, video_url, title, description, thumbnail_url } = body;

    if (!business_id || !platform || !video_url || !title) {
      return c.json({ error: 'Missing required fields: business_id, platform, video_url, title' }, 400);
    }

    // Validate platform
    const validPlatforms = ['tiktok', 'instagram', 'facebook', 'google'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return c.json({ error: 'Invalid platform. Must be: tiktok, instagram, facebook, or google' }, 400);
    }

    // Validate URL format
    if (!video_url.startsWith('http://') && !video_url.startsWith('https://')) {
      return c.json({ error: 'Invalid URL format. Must start with http:// or https://' }, 400);
    }

    const ad_id = `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ad_data = {
      id: ad_id,
      business_id,
      business_name: business_name || 'Unknown Business',
      platform: platform.toLowerCase(),
      video_url,
      title,
      description: description || '',
      thumbnail_url: thumbnail_url || '',
      status: 'pending', // pending, approved, rejected
      created_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
      views: 0,
      clicks: 0
    };

    await kv.set(`ad:${ad_id}`, ad_data);
    
    console.log(`✅ Ad submitted: ${ad_id} by ${business_name} (${platform})`);

    return c.json({ 
      success: true,
      ad: ad_data,
      message: 'Ad submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    console.error('❌ Error submitting ad:', error);
    return c.json({ error: 'Failed to submit ad' }, 500);
  }
});

// Get ads for a specific business
app.get("/make-server-175b2872/ads/business/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    const allAds = await kv.getByPrefix('ad:');
    
    const businessAds = allAds
      .filter((ad: any) => ad.business_id === businessId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ ads: businessAds });
  } catch (error) {
    console.error('❌ Error fetching business ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Get all ads (for admin review)
app.get("/make-server-175b2872/ads/all", async (c) => {
  try {
    const allAds = await kv.getByPrefix('ad:');
    
    const sortedAds = allAds.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ ads: sortedAds });
  } catch (error) {
    console.error('❌ Error fetching all ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Get approved ads (for landing page display)
app.get("/make-server-175b2872/ads/approved", async (c) => {
  try {
    const allAds = await kv.getByPrefix('ad:');
    
    const approvedAds = allAds
      .filter((ad: any) => ad.status === 'approved')
      .sort((a: any, b: any) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime());

    return c.json({ ads: approvedAds });
  } catch (error) {
    console.error('❌ Error fetching approved ads:', error);
    return c.json({ error: 'Failed to fetch approved ads' }, 500);
  }
});

// Approve an ad (admin only)
app.patch("/make-server-175b2872/ads/:adId/approve", async (c) => {
  try {
    const adId = c.req.param('adId');
    const body = await c.req.json();
    const { admin_name } = body;

    const ad = await kv.get(`ad:${adId}`);
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    const updatedAd = {
      ...ad,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin_name || 'Admin',
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null
    };

    await kv.set(`ad:${adId}`, updatedAd);
    
    console.log(`✅ Ad approved: ${adId} by ${admin_name}`);

    return c.json({ 
      success: true,
      ad: updatedAd,
      message: 'Ad approved successfully'
    });
  } catch (error) {
    console.error('❌ Error approving ad:', error);
    return c.json({ error: 'Failed to approve ad' }, 500);
  }
});

// Reject an ad (admin only)
app.patch("/make-server-175b2872/ads/:adId/reject", async (c) => {
  try {
    const adId = c.req.param('adId');
    const body = await c.req.json();
    const { admin_name, reason } = body;

    const ad = await kv.get(`ad:${adId}`);
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    const updatedAd = {
      ...ad,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: admin_name || 'Admin',
      rejection_reason: reason || 'Does not meet content guidelines',
      approved_at: null,
      approved_by: null
    };

    await kv.set(`ad:${adId}`, updatedAd);
    
    console.log(`❌ Ad rejected: ${adId} by ${admin_name} - Reason: ${reason}`);

    return c.json({ 
      success: true,
      ad: updatedAd,
      message: 'Ad rejected'
    });
  } catch (error) {
    console.error('❌ Error rejecting ad:', error);
    return c.json({ error: 'Failed to reject ad' }, 500);
  }
});

// Delete an ad
app.delete("/make-server-175b2872/ads/:adId", async (c) => {
  try {
    const adId = c.req.param('adId');
    
    await kv.del(`ad:${adId}`);
    
    console.log(`🗑️ Ad deleted: ${adId}`);

    return c.json({ 
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting ad:', error);
    return c.json({ error: 'Failed to delete ad' }, 500);
  }
});

// Track ad view
app.post("/make-server-175b2872/ads/:adId/view", async (c) => {
  try {
    const adId = c.req.param('adId');
    const ad = await kv.get(`ad:${adId}`);
    
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await kv.set(`ad:${adId}`, ad);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking ad view:', error);
    return c.json({ error: 'Failed to track view' }, 500);
  }
});

// Track ad click
app.post("/make-server-175b2872/ads/:adId/click", async (c) => {
  try {
    const adId = c.req.param('adId');
    const ad = await kv.get(`ad:${adId}`);
    
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      await kv.set(`ad:${adId}`, ad);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking ad click:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('❌ Unhandled error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

Deno.serve(app.fetch);