-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count by category
SELECT 
    CASE 
        WHEN table_name IN ('users', 'businesses', 'specials', 'reservations', 'checkins', 
                            'special_clicks', 'reviews', 'events', 'payments', 
                            'analytics_clicks', 'menu_items') THEN 'Core Tables'
        WHEN table_name IN ('partners', 'referrals', 'partner_visits', 
                            'partner_earnings', 'partner_payouts') THEN 'Referral System'
        ELSE 'Other'
    END as category,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
GROUP BY category;
