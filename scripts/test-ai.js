#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🤖 MatchAI AI Functionality Test')
console.log('================================\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  console.log('Run "npm run setup" to create it.')
  process.exit(1)
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

console.log('📋 Environment Check:')
console.log('====================')

// Check Supabase configuration
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

console.log(`Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
console.log(`Supabase Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`)
console.log(`Supabase Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`)

// Check Google AI configuration
const googleAIKey = envVars.GOOGLE_AI_API_KEY || envVars.NEXT_PUBLIC_GOOGLE_AI_API_KEY
console.log(`Google AI API Key: ${googleAIKey ? '✅ Set' : '❌ Missing'}`)

console.log('\n🔧 AI Configuration Status:')
console.log('==========================')

if (googleAIKey && googleAIKey !== 'your_google_ai_api_key') {
  console.log('✅ Google Gemini AI is configured')
  console.log('   - Advanced AI features will be available')
  console.log('   - Profile compatibility analysis enabled')
  console.log('   - AI-generated summaries enabled')
  console.log('   - Networking insights enabled')
} else {
  console.log('⚠️  Google AI API key not configured')
  console.log('   - Using fallback algorithms')
  console.log('   - Basic AI features available')
  console.log('   - Get API key from: https://makersuite.google.com/app/apikey')
}

console.log('\n📊 Database Status:')
console.log('==================')

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configuration found')
  console.log('   - Database connection should work')
  console.log('   - User profiles will be stored')
  console.log('   - AI insights will be saved')
} else {
  console.log('❌ Supabase configuration missing')
  console.log('   - Database features will not work')
  console.log('   - Create project at: https://supabase.com')
}

console.log('\n🚀 Next Steps:')
console.log('==============')

if (!googleAIKey || googleAIKey === 'your_google_ai_api_key') {
  console.log('1. Get Google AI API key from https://makersuite.google.com/app/apikey')
  console.log('2. Add it to .env.local as GOOGLE_AI_API_KEY')
  console.log('3. Restart your development server')
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('1. Create Supabase project at https://supabase.com')
  console.log('2. Get your project URL and API keys')
  console.log('3. Add them to .env.local')
  console.log('4. Run the SQL scripts in scripts/ folder')
}

console.log('\n5. Run "npm run dev" to start the development server')
console.log('6. Visit http://localhost:3000 to test the application')

console.log('\n📝 Test Commands:')
console.log('=================')
console.log('- npm run dev          # Start development server')
console.log('- npm run setup        # Recreate environment file')
console.log('- npm run build        # Build for production')

console.log('\n✅ Test completed!') 