-- Enhanced seed data for AI Live Matching platform

-- Insert sample users with comprehensive profiles
INSERT INTO users (
    email, full_name, avatar_url, bio, company, position, industry, location,
    interests, skills, goals, experience_level, timezone, ai_profile_summary,
    qualification_score, satisfaction_rating
) VALUES
(
    'sarah.chen@techcorp.com', 'Sarah Chen', '/placeholder.svg?height=64&width=64',
    'Passionate software engineer with 5 years of experience in AI/ML. Love building products that make a difference.',
    'TechCorp', 'Senior Software Engineer', 'Technology', 'San Francisco, CA',
    ARRAY['AI/ML', 'Product Development', 'Startups', 'Mentoring'],
    ARRAY['Python', 'React', 'Machine Learning', 'System Design'],
    ARRAY['Learn about AI ethics', 'Find co-founder', 'Expand network'],
    'senior', 'America/Los_Angeles',
    'Experienced engineer passionate about AI applications with strong technical leadership skills.',
    94, 4.7
),
(
    'marcus.johnson@fintech.io', 'Marcus Johnson', '/placeholder.svg?height=64&width=64',
    'Fintech entrepreneur and investor. Previously founded two successful startups. Now focusing on sustainable finance.',
    'FinTech Innovations', 'Co-Founder & CEO', 'Finance', 'New York, NY',
    ARRAY['Fintech', 'Sustainability', 'Investing', 'Leadership'],
    ARRAY['Business Strategy', 'Fundraising', 'Team Building', 'Financial Modeling'],
    ARRAY['Scale current startup', 'Find technical co-founder', 'Impact investing'],
    'expert', 'America/New_York',
    'Serial entrepreneur with deep fintech expertise and strong network in sustainable finance.',
    92, 4.5
),
(
    'elena.rodriguez@healthtech.com', 'Elena Rodriguez', '/placeholder.svg?height=64&width=64',
    'Healthcare innovation specialist focused on digital health solutions. MD turned product manager.',
    'HealthTech Solutions', 'VP of Product', 'Healthcare', 'Austin, TX',
    ARRAY['Digital Health', 'Medical Devices', 'Patient Care', 'Innovation'],
    ARRAY['Product Management', 'Healthcare Regulations', 'UX Design', 'Clinical Research'],
    ARRAY['Launch new health platform', 'Connect with investors', 'Regulatory guidance'],
    'senior', 'America/Chicago',
    'Medical professional with strong product management skills in digital health innovation.',
    89, 4.3
),
(
    'david.kim@airesearch.org', 'David Kim', '/placeholder.svg?height=64&width=64',
    'AI researcher and academic. PhD in Computer Science. Working on ethical AI and bias reduction.',
    'AI Research Institute', 'Research Scientist', 'Research', 'Boston, MA',
    ARRAY['AI Ethics', 'Research', 'Academia', 'Policy'],
    ARRAY['Deep Learning', 'Research Methodology', 'Academic Writing', 'Python'],
    ARRAY['Publish research', 'Industry collaboration', 'Policy influence'],
    'expert', 'America/New_York',
    'Leading AI researcher focused on ethical applications with strong academic background.',
    91, 4.6
),
(
    'priya.patel@startup.co', 'Priya Patel', '/placeholder.svg?height=64&width=64',
    'Early-stage startup founder building the next generation of e-commerce tools. Former consultant.',
    'Commerce AI', 'Founder', 'E-commerce', 'Seattle, WA',
    ARRAY['E-commerce', 'AI Tools', 'Entrepreneurship', 'Growth'],
    ARRAY['Business Development', 'AI Integration', 'Customer Success', 'Analytics'],
    ARRAY['Raise Series A', 'Scale team', 'Product-market fit'],
    'intermediate', 'America/Los_Angeles',
    'Ambitious founder with consulting background building innovative e-commerce solutions.',
    87, 4.2
);

-- Insert sample events
INSERT INTO events (
    name, description, event_type, start_date, end_date, timezone, max_participants, tags
) VALUES
(
    'AI Innovation Summit 2024', 
    'Connect with AI researchers, entrepreneurs, and investors to explore the future of artificial intelligence.',
    'conference', 
    '2024-03-15 09:00:00+00', '2024-03-17 18:00:00+00', 
    'America/Los_Angeles', 500,
    ARRAY['AI', 'Innovation', 'Networking', 'Technology']
),
(
    'Startup Founder Meetup', 
    'Monthly gathering for startup founders to share experiences, challenges, and opportunities.',
    'meetup', 
    '2024-02-20 18:00:00+00', '2024-02-20 21:00:00+00', 
    'America/New_York', 50,
    ARRAY['Startups', 'Entrepreneurship', 'Networking']
),
(
    'Women in Tech Leadership', 
    'Empowering women leaders in technology through mentorship and networking.',
    'workshop', 
    '2024-02-25 10:00:00+00', '2024-02-25 16:00:00+00', 
    'America/Chicago', 100,
    ARRAY['Women in Tech', 'Leadership', 'Mentorship']
);

-- Register users for events
INSERT INTO event_participants (event_id, user_id, attendance_status) 
SELECT e.id, u.id, 'confirmed'
FROM events e, users u
WHERE e.name = 'AI Innovation Summit 2024' AND u.email IN (
    'sarah.chen@techcorp.com', 'david.kim@airesearch.org', 'priya.patel@startup.co'
);

-- Insert AI-generated matches
INSERT INTO matches (
    user1_id, user2_id, event_id, match_score, compatibility_factors, ai_explanation, status
) 
SELECT 
    u1.id, u2.id, e.id, 
    ROUND((RANDOM() * 30 + 70)::numeric, 2),
    jsonb_build_object(
        'shared_interests', ARRAY['AI', 'Innovation'],
        'complementary_skills', ARRAY['Technical', 'Business'],
        'goal_alignment', 0.85,
        'experience_compatibility', 0.92
    ),
    'High compatibility based on shared interest in AI innovation and complementary technical/business skills. Both are passionate about ethical AI development.',
    'active'
FROM users u1, users u2, events e
WHERE u1.id != u2.id 
    AND u1.email = 'sarah.chen@techcorp.com' 
    AND u2.email = 'david.kim@airesearch.org'
    AND e.name = 'AI Innovation Summit 2024';

-- Create conversations for matches
INSERT INTO conversations (match_id, type, title, is_active, last_message_at)
SELECT m.id, 'match_chat', 
    'Chat with ' || u2.full_name,
    true, NOW()
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id;

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content, message_type, sent_at)
SELECT c.id, m.user1_id, 
    'Hi! I saw we matched for the AI Innovation Summit. I''d love to chat about your work in ethical AI!',
    'text', NOW() - INTERVAL '2 hours'
FROM conversations c
JOIN matches m ON c.match_id = m.id
LIMIT 1;

-- Insert sample meetings
INSERT INTO meetings (
    conversation_id, organizer_id, title, description, scheduled_at, 
    duration_minutes, meeting_type, status
)
SELECT c.id, m.user1_id,
    'AI Ethics Discussion',
    'Let''s discuss the intersection of AI research and practical applications in ethical AI development.',
    NOW() + INTERVAL '2 days',
    45, 'video', 'scheduled'
FROM conversations c
JOIN matches m ON c.match_id = m.id
LIMIT 1;

-- Insert KPI metrics
INSERT INTO kpi_metrics (metric_name, metric_value, metric_unit, percentage_change, metadata) VALUES
('total_users', 150, 'count', 12.5, '{"active_users": 142, "new_signups_this_week": 18}'),
('active_matches', 89, 'count', 8.3, '{"pending": 23, "accepted": 66}'),
('scheduled_meetings', 34, 'count', 15.2, '{"completed": 28, "upcoming": 6}'),
('avg_match_score', 82.4, 'score', 3.1, '{"min": 65.2, "max": 96.8}'),
('user_satisfaction', 4.3, 'rating', 2.8, '{"responses": 87, "nps": 72}'),
('message_volume', 1247, 'count', 22.1, '{"daily_avg": 178, "peak_hour": "14:00"}');

-- Insert insights
INSERT INTO insights (title, description, type, priority, data) VALUES
(
    'High-Quality Matches Detected',
    'AI matching algorithm showing 94% accuracy in successful connections this week',
    'success', 1,
    '{"accuracy": 0.94, "successful_meetings": 28, "total_matches": 89}'
),
(
    'Peak Activity Hours Identified',
    'Users most active between 2-4 PM EST, optimal time for match notifications',
    'info', 2,
    '{"peak_start": "14:00", "peak_end": "16:00", "timezone": "EST", "activity_increase": 0.35}'
),
(
    'Geographic Clustering Opportunity',
    'High concentration of users in SF Bay Area - consider local meetup events',
    'opportunity', 3,
    '{"location": "SF Bay Area", "user_count": 47, "match_potential": 0.78}'
);
