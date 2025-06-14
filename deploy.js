#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 MAYAAALOKAM Roleplay - Deployment Preparation Script');
console.log('==================================================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} found`, 'green');
    return true;
  } else {
    log(`❌ ${description} missing`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`🔄 ${description}...`, 'blue');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        reject(error);
      } else {
        log(`✅ ${description} completed`, 'green');
        resolve(stdout);
      }
    });
  });
}

async function main() {
  let allChecksPass = true;

  // Check required files
  log('📋 Checking required files...', 'blue');
  const requiredFiles = [
    ['package.json', 'Package configuration'],
    ['next.config.js', 'Next.js configuration'],
    ['tailwind.config.js', 'Tailwind configuration'],
    ['tsconfig.json', 'TypeScript configuration'],
    ['.env.example', 'Environment template'],
    ['render.yaml', 'Render deployment configuration'],
    ['.gitignore', 'Git ignore file']
  ];

  requiredFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      allChecksPass = false;
    }
  });

  // Check environment variables
  log('\n🔧 Checking environment configuration...', 'blue');
  if (fs.existsSync('.env')) {
    log('✅ Environment file found', 'green');
    
    // Read and validate .env file
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const requiredEnvVars = [
        'BOT_TOKEN',
        'APPLICATION_GUILD_ID',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'DISCORD_CLIENT_ID',
        'DISCORD_CLIENT_SECRET'
      ];

      const missingVars = requiredEnvVars.filter(varName => 
        !envContent.includes(`${varName}=`) || 
        envContent.includes(`${varName}=your_`) ||
        envContent.includes(`${varName}=test_`)
      );

      if (missingVars.length > 0) {
        log(`⚠️  Environment variables need configuration: ${missingVars.join(', ')}`, 'yellow');
        log('💡 Update your .env file with real values before deployment', 'yellow');
      } else {
        log('✅ Environment variables appear configured', 'green');
      }
    } catch (error) {
      log('❌ Error reading .env file', 'red');
      allChecksPass = false;
    }
  } else {
    log('⚠️  No .env file found. Copy .env.example to .env and configure it', 'yellow');
  }

  // Run build tests
  log('\n🛠️  Running build tests...', 'blue');
  try {
    await runCommand('npm install', 'Installing dependencies');
    await runCommand('npm run lint', 'Running linter');
    await runCommand('npm run build', 'Building frontend');
    await runCommand('npm run bot:build', 'Building backend');
    
    // Check build outputs
    if (checkFile('.next', 'Frontend build output') && 
        checkFile('backend/dist', 'Backend build output')) {
      log('✅ All builds successful', 'green');
    } else {
      log('❌ Build outputs missing', 'red');
      allChecksPass = false;
    }
  } catch (error) {
    log('❌ Build process failed', 'red');
    allChecksPass = false;
  }

  // Git repository check
  log('\n📁 Checking Git repository...', 'blue');
  if (checkFile('.git', 'Git repository')) {
    try {
      await runCommand('git status --porcelain', 'Checking Git status');
      log('✅ Git repository ready', 'green');
    } catch (error) {
      log('⚠️  Git repository may have issues', 'yellow');
    }
  } else {
    log('⚠️  Not a Git repository. Initialize with: git init', 'yellow');
  }

  // Final report
  log('\n📊 Deployment Readiness Report', 'blue');
  log('=================================', 'blue');
  
  if (allChecksPass) {
    log('🎉 All checks passed! Your project is ready for deployment.', 'green');
    log('\n📝 Next steps:', 'blue');
    log('1. Push your code to GitHub', 'reset');
    log('2. Connect your GitHub repo to Render', 'reset');
    log('3. Configure environment variables in Render dashboard', 'reset');
    log('4. Deploy using the render.yaml configuration', 'reset');
    log('\n🔗 Useful links:', 'blue');
    log('- Render Dashboard: https://dashboard.render.com', 'reset');
    log('- Deployment Guide: ./DEPLOYMENT_GUIDE.md', 'reset');
  } else {
    log('⚠️  Some issues were found. Please address them before deployment.', 'yellow');
    log('\n🔧 Common fixes:', 'yellow');
    log('- Install dependencies: npm install', 'reset');
    log('- Copy environment template: cp .env.example .env', 'reset');
    log('- Configure your .env file with real values', 'reset');
    log('- Initialize Git: git init', 'reset');
  }

  log('\n🆘 Need help? Check the DEPLOYMENT_GUIDE.md file', 'blue');
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  log(`❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  log(`❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
}); 