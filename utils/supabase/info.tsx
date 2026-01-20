/* 
 * Supabase Configuration
 * 
 * IMPORTANT FOR DEPLOYMENT:
 * - For production: Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in Vercel
 * - For local dev: Create .env file with these variables
 * - Current values below are for development only
 */

// Development fallback values (replace with environment variables in production)
const DEV_PROJECT_ID = 'skpkuhhvcslzdopfccxo';
const DEV_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGt1aGh2Y3NsemRvcGZjY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTMxMzEsImV4cCI6MjA3ODA4OTEzMX0.sUKl3ujqAJJ0i4SRQrJjical1HVtHWOL0JJrfdOPRCk';

// Use environment variables if available, otherwise use development fallbacks
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || DEV_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEV_ANON_KEY;

// Log configuration status
if (import.meta.env.VITE_SUPABASE_PROJECT_ID) {
  console.log('✅ Using Supabase credentials from environment variables');
} else {
  console.log('ℹ️ Using development Supabase credentials (fallback)');
  console.log('💡 For production: Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in Vercel dashboard');
}
