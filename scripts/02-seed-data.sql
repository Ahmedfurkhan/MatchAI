-- Insert dummy data for AI Live Matching platform

-- Insert participants
INSERT INTO participants (name, email, avatar_url, industry, company, position, qualification_score, satisfaction_rating) VALUES
('Yen Ha Gui', 'yen.ha@example.com', '/placeholder.svg?height=32&width=32', 'Technology', 'TechCorp', 'Software Engineer', 85, 4.2),
('Yen Ji Sen', 'yen.ji@example.com', '/placeholder.svg?height=32&width=32', 'Finance', 'FinanceInc', 'Analyst', 78, 4.0),
('Yen Jia Yun', 'yen.jia@example.com', '/placeholder.svg?height=32&width=32', 'Marketing', 'MarketPro', 'Manager', 92, 4.5),
('Che Do Yun', 'che.do@example.com', '/placeholder.svg?height=32&width=32', 'Healthcare', 'MedTech', 'Director', 88, 4.3),
('Ja Sen Yun', 'ja.sen@example.com', '/placeholder.svg?height=32&width=32', 'Education', 'EduCorp', 'Principal', 76, 3.9),
('Che Seo Yun', 'che.seo@example.com', '/placeholder.svg?height=32&width=32', 'Technology', 'StartupXYZ', 'CTO', 94, 4.7),
('Amy Min Jun', 'amy.min@example.com', '/placeholder.svg?height=32&width=32', 'Consulting', 'ConsultCorp', 'Senior Consultant', 82, 4.1),
('Lee Seo Yun', 'lee.seo@example.com', '/placeholder.svg?height=32&width=32', 'Retail', 'RetailChain', 'Operations Manager', 79, 4.0),
('Jenny Do Yun', 'jenny.do@example.com', '/placeholder.svg?height=32&width=32', 'Real Estate', 'PropertyPro', 'Agent', 87, 4.4),
('Lee Ji Seo', 'lee.ji@example.com', '/placeholder.svg?height=32&width=32', 'Manufacturing', 'ManufactureCorp', 'Plant Manager', 83, 4.2);

-- Insert events
INSERT INTO events (name, description, start_date, end_date) VALUES
('Tech Innovation Summit 2024', 'Annual technology and innovation conference', '2024-01-15 09:00:00+00', '2024-01-17 18:00:00+00'),
('Business Networking Expo', 'Professional networking and business development event', '2024-02-20 10:00:00+00', '2024-02-22 17:00:00+00');

-- Insert matches
INSERT INTO matches (participant1_id, participant2_id, event_id, match_score, status) 
SELECT 
    p1.id, p2.id, e.id, 
    ROUND((RANDOM() * 40 + 60)::numeric, 2) as match_score,
    CASE WHEN RANDOM() > 0.7 THEN 'completed' ELSE 'active' END as status
FROM participants p1
CROSS JOIN participants p2
CROSS JOIN events e
WHERE p1.id != p2.id
AND RANDOM() > 0.7
LIMIT 20;

-- Insert meetings
INSERT INTO meetings (match_id, title, scheduled_at, status)
SELECT 
    m.id,
    'Meeting between ' || p1.name || ' and ' || p2.name,
    NOW() + (RANDOM() * INTERVAL '7 days'),
    CASE WHEN RANDOM() > 0.6 THEN 'scheduled' ELSE 'completed' END
FROM matches m
JOIN participants p1 ON m.participant1_id = p1.id
JOIN participants p2 ON m.participant2_id = p2.id
WHERE RANDOM() > 0.5
LIMIT 15;

-- Insert activity logs
INSERT INTO activity_logs (participant_id, event_id, activity_type, timestamp)
SELECT 
    p.id,
    e.id,
    CASE 
        WHEN RANDOM() > 0.7 THEN 'login'
        WHEN RANDOM() > 0.4 THEN 'profile_update'
        ELSE 'match_interaction'
    END,
    NOW() - (RANDOM() * INTERVAL '24 hours')
FROM participants p
CROSS JOIN events e
WHERE RANDOM() > 0.3
LIMIT 100;

-- Insert insights
INSERT INTO insights (title, description, type, priority) VALUES
('Surge Industry-Identified', 'Match success rate between AI-powered integrations quality', 'warning', 1),
('Numerous Uncompleted Profiles', '24 participants completing profiles, potentially low quality', 'warning', 2),
('High Engagement Rate', 'User engagement has increased by 15% this week', 'success', 3),
('Peak Activity Hours', 'Most active hours are between 2-4 PM', 'info', 4);

-- Insert KPI metrics
INSERT INTO kpi_metrics (metric_name, metric_value, metric_unit, percentage_change) VALUES
('total_participants', 150, 'count', 12.5),
('real_time_qualified', 29, 'count', -5.2),
('qualified_percentage', 19, 'percent', -5.2),
('total_matches', 160, 'count', 8.7),
('average_satisfaction', 78, 'percent', 3.2),
('total_meetings', 18, 'count', 15.8),
('peak_hours', 4.3, 'hours', 2.1);
