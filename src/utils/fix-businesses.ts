/**
 * Utility script to diagnose and fix business visibility issues
 * 
 * This script helps identify why manually created businesses aren't showing up
 * in the customer app and provides a one-click fix.
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

/**
 * Diagnose all businesses to find visibility issues
 */
export async function diagnoseBusinesses() {
  try {
    const response = await fetch(`${API_BASE}/admin/diagnose-businesses`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to diagnose businesses: ${response.statusText}`);
    }
    
    const diagnosis = await response.json();
    
    console.log('📊 Business Visibility Diagnosis:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Total businesses: ${diagnosis.total_businesses}`);
    console.log(`👁️  Visible in customer app: ${diagnosis.visible_in_customer_app}`);
    console.log(`🔒 Hidden businesses: ${diagnosis.hidden_businesses.length}`);
    console.log('');
    
    if (diagnosis.hidden_businesses.length > 0) {
      console.log('🔍 Hidden Businesses:');
      diagnosis.hidden_businesses.forEach((business: any) => {
        console.log(`  • ${business.name} (${business.id})`);
        console.log(`    Issues: ${business.issues.join(', ')}`);
      });
      console.log('');
      console.log('💡 Run fixAllBusinesses() to make all businesses visible');
    }
    
    return diagnosis;
  } catch (error) {
    console.error('❌ Error diagnosing businesses:', error);
    throw error;
  }
}

/**
 * Fix a single business to make it visible in the customer app
 */
export async function fixBusinessVisibility(businessId: string) {
  try {
    const response = await fetch(`${API_BASE}/admin/fix-business-visibility/${businessId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fix business: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ ${result.message}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error fixing business ${businessId}:`, error);
    throw error;
  }
}

/**
 * Fix ALL businesses to make them visible in the customer app
 */
export async function fixAllBusinesses() {
  try {
    console.log('🔧 Fixing all businesses...');
    
    const response = await fetch(`${API_BASE}/admin/fix-all-businesses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fix businesses: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ${result.message}`);
    console.log(`📊 Total businesses: ${result.total_businesses}`);
    console.log(`🔧 Fixed: ${result.fixed_count}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 All businesses are now visible in the customer app!');
    console.log('💡 Refresh the customer app to see the changes');
    
    return result;
  } catch (error) {
    console.error('❌ Error fixing all businesses:', error);
    throw error;
  }
}

/**
 * Quick fix - run diagnosis and fix all in one go
 */
export async function quickFix() {
  console.log('🚀 Running quick fix...\n');
  
  // First, diagnose
  await diagnoseBusinesses();
  
  // Then, fix all issues
  await fixAllBusinesses();
  
  // Finally, run diagnosis again to confirm
  console.log('\n📊 Re-checking after fix:');
  await diagnoseBusinesses();
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).diagnoseBusinesses = diagnoseBusinesses;
  (window as any).fixBusinessVisibility = fixBusinessVisibility;
  (window as any).fixAllBusinesses = fixAllBusinesses;
  (window as any).quickFix = quickFix;
}
