# AI Live Matching Platform

A modern, mobile-first AI-powered live matching platform built with Next.js, React, and Supabase.

## 🚀 Features

### ✅ **Complete Feature Set**
- **Profile Management**: Comprehensive user profiles with AI-generated summaries
- **AI-Powered Matching**: Google Gemini integration for intelligent compatibility analysis
- **Real-time Chat**: Modern chat interface with message history
- **Meeting Scheduler**: Advanced scheduling with calendar integration
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **PostgreSQL Database**: Complete schema with relationships and indexes
- **Edge Functions**: Supabase edge functions for AI matching and notifications
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment

### 🤖 **AI Features**
- **Profile Compatibility Analysis**: AI-powered matching using Google Gemini 1.5 Flash
- **Enhanced Profile Summaries**: AI-generated professional summaries and insights
- **Networking Recommendations**: Personalized networking advice and connection suggestions
- **Conversation Starters**: AI-generated conversation starters for new matches
- **Fallback Algorithms**: Intelligent fallback when AI is unavailable
- **Real-time AI Status**: Live status indicators for AI configuration

### 🎨 **Modern UI Design**
- Gradient backgrounds and glass morphism effects
- Smooth animations with Framer Motion
- Mobile-optimized navigation
- Card-based layouts with hover effects
- Modern color schemes and typography

### 🛠 **Technical Stack**
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: PostgreSQL with Supabase
- **AI Integration**: Google Gemini 1.5 Flash for matching algorithms
- **Real-time**: Supabase real-time subscriptions
- **Deployment**: Vercel with automated CI/CD

## 📱 **Mobile-First Features**

- Bottom navigation for easy thumb navigation
- Touch-friendly interface elements
- Responsive grid layouts
- Swipe gestures for match interactions
- Mobile-optimized forms and inputs

## 🔧 **Quick Setup**

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd MatchAI
npm install
```

### 2. Environment Setup
```bash
npm run setup
```
This will create a `.env.local` file with all required environment variables.

### 3. Configure Environment Variables
Edit `.env.local` and add your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI API (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
# OR for client-side usage:
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Get API Keys

#### Google AI API (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file
4. The app uses Google Gemini 1.5 Flash model for AI features

#### Supabase
1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and API keys from the dashboard
3. Add them to your `.env.local` file

### 5. Database Setup
Run the SQL scripts in order:
```bash
# Run these in your Supabase SQL editor
scripts/01-enhanced-schema.sql
scripts/02-seed-enhanced-data.sql
```

### 6. Run Development Server
```bash
npm run dev
```

## 🤖 **AI Configuration**

### AI Features Available
- **Profile Compatibility Analysis**: Analyzes user profiles for optimal matches
- **Enhanced Profile Summaries**: Generates professional summaries and key strengths
- **Networking Insights**: Provides personalized networking recommendations
- **Conversation Starters**: Creates engaging conversation starters for matches
- **Real-time AI Status**: Shows current AI configuration status

### AI Status Indicators
- 🟢 **Enhanced AI**: Google Gemini AI is active and providing advanced features
- 🟡 **Basic AI**: Using fallback algorithms (when API key is not configured)
- ⚠️ **Setup Required**: AI features need configuration

### Fallback System
When Google AI is not configured, the app uses intelligent fallback algorithms:
- Rule-based compatibility scoring
- Local profile analysis
- Pre-defined conversation starters
- Basic networking recommendations

## 📊 **Database Schema**

### Core Tables
- **users**: Comprehensive user profiles with AI summaries
- **events**: Networking events and conferences
- **matches**: AI-generated compatibility matches
- **conversations**: Chat conversations between matches
- **messages**: Real-time messaging system
- **meetings**: Scheduled meetings with participants
- **notifications**: Push notification system

### AI Features
- **ai_matching_sessions**: AI analysis sessions
- **activity_logs**: User behavior tracking
- **insights**: AI-generated platform insights
- **kpi_metrics**: Performance analytics

## 🤖 **AI Integration Details**

### Google Gemini 1.5 Flash Features
- **Profile Compatibility Analysis**: Analyzes user profiles for optimal matches
- **AI-Generated Profile Summaries**: Creates professional summaries and key strengths
- **Conversation Starter Suggestions**: Generates engaging conversation starters
- **Match Explanations**: Provides detailed explanations for match compatibility
- **Networking Insights**: Offers personalized networking advice

### API Endpoints
- `POST /api/ai-match`: Generate AI-powered matches for events
- `POST /api/ai-profile`: Generate profile summaries and insights
- `GET /api/ai-profile`: Get comprehensive AI analysis for a user

### AI Service Methods
```typescript
// Profile compatibility analysis
await geminiService.analyzeProfileCompatibility(user1, user2)

// Generate profile summary
await geminiService.generateProfileSummary(user)

// Enhanced profile analysis
await geminiService.generateEnhancedProfileSummary(user)

// Networking insights
await geminiService.generateNetworkingInsights(user)

// Conversation starters
await geminiService.suggestConversationStarters(user1, user2, sharedInterests)
```

### Error Handling
- Graceful fallback to local algorithms when AI is unavailable
- Comprehensive error logging and user feedback
- Automatic retry mechanisms for transient failures
- User-friendly error messages and status indicators

## 📱 **Mobile Navigation**

### Bottom Navigation (Mobile)
- Home Dashboard
- Discover Matches
- Chat Interface
- Meeting Scheduler
- Profile Management

### Desktop Sidebar
- Expanded navigation with icons
- Real-time notification badges
- Quick action buttons

## 🎯 **Key Components**

1. **ModernDashboard**: Analytics and KPI overview
2. **AIMatching**: Tinder-style matching interface with AI analysis
3. **ModernChat**: Real-time messaging system
4. **MeetingScheduler**: Calendar and scheduling
5. **ProfileManagement**: Comprehensive profile editing
6. **AIInsights**: AI-powered profile analysis and recommendations

## 🔄 **Real-time Features**

- Live chat messaging
- Match notifications
- Meeting reminders
- Activity updates
- Status indicators
- AI analysis status

## 📈 **Analytics & Insights**

- User engagement metrics
- Match success rates
- Meeting completion rates
- AI performance analytics
- Real-time activity tracking
- AI usage statistics

## 🛡️ **Security Features**

- Row Level Security (RLS) policies
- JWT authentication
- API rate limiting
- Input validation and sanitization
- Secure environment variable handling
- AI API key protection

## 🔧 **Troubleshooting**

### Google AI API Issues
- Ensure you're using a valid API key from Google AI Studio
- The app uses Gemini 1.5 Flash model (not the deprecated gemini-pro)
- Fallback algorithms work when AI is unavailable
- Check console for detailed error messages
- Verify API key is properly set in environment variables

### Database Issues
- Run the SQL scripts in the correct order
- Ensure Supabase environment variables are set
- Check Row Level Security policies if data access fails
- Verify database connection in Supabase dashboard

### AI Features Not Working
- Check if `GOOGLE_AI_API_KEY` is set correctly
- Restart development server after adding API key
- Look for AI status indicators in the UI
- Check browser console for error messages
- Verify API key has proper permissions

### Environment Setup
```bash
# Quick environment setup
npm run setup

# Manual setup
cp config/env.example .env.local
# Edit .env.local with your actual values
```

## 🚀 **Deployment**

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_AI_API_KEY` (for AI features)

### CI/CD Pipeline
The GitHub Actions workflow automatically:
- Runs type checking and linting
- Builds the project
- Deploys to Vercel on successful tests

## 📚 **API Documentation**

### AI Profile API
```typescript
// Generate profile summary
POST /api/ai-profile
{
  "userId": "user-id",
  "action": "generate_summary"
}

// Get comprehensive analysis
GET /api/ai-profile?userId=user-id
```

### AI Matching API
```typescript
// Generate matches for an event
POST /api/ai-match
{
  "userId": "user-id",
  "eventId": "event-id"
}
```

This platform provides a complete, production-ready AI-powered matching system with modern UI/UX and comprehensive features for networking and professional connections.
