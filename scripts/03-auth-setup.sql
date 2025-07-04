-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can see matches where they are involved
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" ON matches
  FOR INSERT WITH CHECK (true);

-- Users can see conversations they are part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can see messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Users can see meetings they are involved in
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

CREATE POLICY "Users can create meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

-- Users can see their own activities
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activities" ON user_activities
  FOR INSERT WITH CHECK (true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
