#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 MatchAI Environment Setup')
console.log('============================\n')

const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), 'config', 'env.example')

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment()
    } else {
      console.log('Setup cancelled.')
      rl.close()
    }
  })
} else {
  setupEnvironment()
}

function setupEnvironment() {
  console.log('\n📝 Setting up environment variables...\n')
  
  const envVars = []
  
  // Add basic template
  envVars.push('# MatchAI Environment Configuration')
  envVars.push('# Copy this file to .env.local and fill in your values\n')
  
  // Supabase configuration
  envVars.push('# Supabase Configuration')
  envVars.push('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  envVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  envVars.push('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n')
  
  // Google AI configuration
  envVars.push('# Google AI API (Gemini)')
  envVars.push('# Get your API key from: https://makersuite.google.com/app/apikey')
  envVars.push('GOOGLE_AI_API_KEY=your_google_ai_api_key')
  envVars.push('# OR for client-side usage:')
  envVars.push('NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key\n')
  
  // Development
  envVars.push('# Optional: For development')
  envVars.push('NODE_ENV=development')
  
  // Write to .env.local
  fs.writeFileSync(envPath, envVars.join('\n'))
  
  console.log('✅ Created .env.local file')
  console.log('\n📋 Next steps:')
  console.log('1. Edit .env.local and add your actual values')
  console.log('2. Get Supabase credentials from your Supabase project dashboard')
  console.log('3. Get Google AI API key from https://makersuite.google.com/app/apikey')
  console.log('4. Restart your development server')
  console.log('\n🔗 Useful links:')
  console.log('- Supabase: https://supabase.com')
  console.log('- Google AI Studio: https://makersuite.google.com/app/apikey')
  console.log('- Project README: README.md')
  
  rl.close()
} 